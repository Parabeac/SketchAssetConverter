/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-var */
import { SKETCHTOOL_PROXY, VECTOR_VOLUME, ZIP_SKETCH_COMMAND } from '../config/constants'
import { exec, execSync } from 'child_process';
const fs = require('fs-extra')
const { sep } = require('path')
const del = require('del')
const { Sketch, Page, Artboard, ShapeGroup } = require('sketch-constructor')
const process = require('process');
const sharp = require('sharp');

const cleanUpLimit = 15
fs.ensureDirSync(`${VECTOR_VOLUME}`)


export async function wrapVector(shapeGroup: any) {
  //clean up the temp vectors
  await cleanVectorDir()
  if (!fs.existsSync(VECTOR_VOLUME)) {
    fs.mkdirSync(VECTOR_VOLUME);
  }

  var group = new ShapeGroup(shapeGroup);

  //check platform
  return process.platform == 'darwin' ?
    sketchtoolProcess(group) :
    defaultImageProcess(group.frame.width, group.frame.height);
}

/**
 * wrapping the shape group into a SketchFile so the sketch tool
 * could be apply to it and extract as PNG.
 * @param shapeGroup - vector that is going to be converted into a SketchFile
 */
async function sketchtoolProcess(group: typeof ShapeGroup) {
  var sketch = new Sketch()
  var page = new Page({
    name: 'testPage'
  })
  var artboard = new Artboard({
    name: 'vector',
    frame: {
      width: group.frame.width,
      height: group.frame.height
    }
  })
  artboard.addLayer(group)
  page.addArtboard(artboard)
  sketch.addPage(page)

  var tempPath = fs.mkdtempSync(`${VECTOR_VOLUME}${sep}`)

  // Creating the sketch file where we are going to inject the shape group.
  await sketch.build(`${tempPath}/vector.sketch`).then(() => {
    console.log('Built')
  })
  try {
    execSync(`sh ${SKETCHTOOL_PROXY} export artboards ${tempPath}/vector.sketch --output=${tempPath}`);
    var readStream = fs.createReadStream(`${tempPath}/vector.png`)
    return readStream
  } catch (error) {
    // platform is darwin but sketchtool could not be found
    return defaultImageProcess(group.frame.width, group.frame.height);
  }

}

/**
 * Performs the resizing that reflects the `shapeGroup` on a default picture.
 * NOTE: this method executes because the Sketchtool is unavailable
 */
async function defaultImageProcess(width: number, height: number) {
  var tempPath = fs.mkdtempSync(`${VECTOR_VOLUME}${sep}`)
  await sharp('./assets/sketchtool-unavailable.png')
    .resize({ height: Math.round(height), width: Math.round(width) })
    .toFile(`${tempPath}/no-sketchfile-vector.png`);

  return fs.createReadStream(`${tempPath}/no-sketchfile-vector.png`);
}

/**
 * Deletes the directory of the vectors if it reaches the limit on directory size
 */
async function cleanVectorDir() {
  var files = fs.readdirSync(VECTOR_VOLUME);

  if (files.length >= cleanUpLimit) {
    await del(VECTOR_VOLUME)
  }
  return VECTOR_VOLUME
}


export async function processLocalVector(uuid: string, path: string, width: number, height: number) : Promise<any>{
  //check platform
  if (process.platform != 'darwin') {
    // Throw error if user did not pass width or height
    if (!width || !height) {
      throw new Error('Platform ' + process.platform + ' is unsupported.');
    }
    // Otherwise, return a default, resized image
    else {
      return defaultImageProcess(width, height);
    }
  }

  //Clean directories before processing
  await cleanVectorDir();
  if (!fs.existsSync(VECTOR_VOLUME)) {
    fs.mkdirSync(VECTOR_VOLUME);
  }

  try{
    /* 
    This method will remove a shadow if any from the sketch file.
    It will return a path and this will path point to the 
    sketchfile to be used to export a layer
    */
    const newDir = await removeShadows(uuid, path);

    /* 
      If this statement is true, it means that no shadow was found
      and procced as normal exporting the layer with the given UUID,
      then just read the png image, delete the exported image or images
      depending on the export config of the given UUID layer, and lastly
      just return the image.
    */
    if (newDir === path) {

      const splitPathArray = path.split('/',);
      const nameSketchFile = splitPathArray[splitPathArray.length -1];
      splitPathArray.pop();
      const dir = splitPathArray.join('/');

      await execShell(` sh ${SKETCHTOOL_PROXY} export layers ${dir}/${nameSketchFile} --item=${uuid} --output=${dir} --use-id-for-name`); 
      const imagePng = await fs.createReadStream(`${dir}/${uuid}.png`);
      await execShell(` rm ${dir}/*.png`);
      return imagePng;  
    }
    /* 
      Else, if a shadow if found, the new directory contains a modified version(meaning taking off the shadow) 
      of the original sketch file, use sketchtool to export the UUID layer, 
      read the image, delete the new directory. Lastly send back the image/
    */
    await execShell(` sh ${SKETCHTOOL_PROXY} export layers ${newDir}/modFile.sketch --item=${uuid} --output=${newDir} --use-id-for-name`); 
    const imagePng = await fs.createReadStream(`${newDir}/${uuid}.png`);
    await execShell(`rm -rf ${newDir}`);
    return imagePng;

  } catch (error) {
    // platform is darwin but sketchtool could not be found
    if (!width || !height) {
      throw new Error('Sketch is not installed or was not detected.');
    }
    else {
      return defaultImageProcess(width, height);
    }
  }
}

async function removeShadows(uuid: string, path: string): Promise<string>{
  try {
    
    /* 
      What I'm doing in the next few lines, I'm tokenizing the path, so 
      I can get the path and the name of the sketch file, and use the path to 
      create a temporary folder and copy paste the sketch file there, so 
      I can unzip it there and do remove the shadow.
    */
    const splitPathArray = path.split('/',);
    const nameSketchFile = splitPathArray[splitPathArray.length -1];
    splitPathArray.pop();
    const dir = splitPathArray.join('/');
    
    if (!fs.existsSync(dir+`/temp-${uuid}`)){
      await fs.mkdir(dir+`/temp-${uuid}`);
    }
    await execShell(`cd ${dir}; cp ${nameSketchFile} temp-${uuid}/ `);
    
    const newDir = dir+`/temp-${uuid}`
    await execShell( `unzip  ${newDir}/${nameSketchFile} -d ${newDir}` ); 
    

    /* 
      Here start the process of finding the shadow, it will go through 3 layers,
      if the shadow was found, the code will disable the shadow and zip back up
      all the files to create a new sketch file under the name of modFile.sketch
    */
    let foundImage = false;
    const pages = await fs.readdir( `${newDir}/pages/` );

    for (const page of pages) {

      const rawJsonData = fs.readFileSync( `${newDir}/pages/${page}` );
      const jsonFormat = JSON.parse(rawJsonData.toString());

      const listOfLayers = jsonFormat["layers"];

      for (const index in listOfLayers) {
        const layerObject = listOfLayers[index];

        if (uuid === layerObject["do_objectID"]) {
          // first layer
          try {
            const checkIfShadow = layerObject["style"]["shadows"][0];
            if (checkIfShadow !== undefined) {
              layerObject["style"]["shadows"][0]["isEnabled"] = false;
              foundImage = true;
            }
            break;
          } catch (error) {
            throw new Error("There's an error inside the first list of layers");
          }
        }
        const secondListOfLayers = layerObject["layers"];

        for (const secondIndex in secondListOfLayers) {
          const layerObjectFromSecondList = secondListOfLayers[secondIndex];

          if (uuid === layerObjectFromSecondList["do_objectID"]) {
            // Second layer
            try {
              const checkIfShadowOnSecondLayer = layerObjectFromSecondList["style"]["shadows"][0];
              if (checkIfShadowOnSecondLayer !== undefined) {
                layerObjectFromSecondList["style"]["shadows"][0]["isEnabled"] = false; 
                foundImage = true;
              }
              break;

            } catch (error) {
              throw new Error("There's an error inside the second list of layers");
            }
          }

          const thirdListOfLayers = layerObjectFromSecondList["layers"];

          for (const thirdIndex in thirdListOfLayers) {
            const layerObjectFromThirdList = thirdListOfLayers[thirdIndex];

            if (layerObjectFromThirdList["do_objectID"] === uuid) {
              // Third layer
              try {
                const checkIfShadowOnThirdLayer = layerObjectFromThirdList["style"]["shadows"][0];
                if (checkIfShadowOnThirdLayer !== undefined) {
                  layerObjectFromThirdList["style"]["shadows"][0]["isEnabled"] = false;
                  foundImage = true;
                  
                }
              } catch (error) {
                throw new Error("There's an error inside the third list of layers");
              }

            }
          }
        }
      }

      if (foundImage) {
        const jsonString = JSON.stringify(jsonFormat);

        await fs.writeFile(page, jsonString, function (err: Error) {
          if (err) throw err;
          console.log("Saved!");
        });
        foundImage = false;

        await execShell( `mv ${page} ${newDir}/pages/` );
        await execShell( `cd ${newDir}/ ; ${ZIP_SKETCH_COMMAND}` );
        console.log('Returned the new path');
        return newDir;
      }
    }

    console.log('Returned the original path');
    execShell(`rm -rf ${newDir}`);
    return path;
  } catch (error) {
    throw new Error("There's an error inside the removeShadows methods");
  }
}

function execShell(cmd: string) {
  return new Promise((resolve) => {
    exec(cmd, (error: unknown, stdout: unknown, stderr: unknown) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}
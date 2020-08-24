/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-var */
import { SKETCHTOOL_PROXY, VECTOR_VOLUME } from '../config/constants'
import { execSync } from 'child_process'

const fs = require('fs-extra')
const { sep } = require('path')
const del = require('del')
const { exec } = require('child_process')
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
    execSync(`sh ${SKETCHTOOL_PROXY} export artboards ${tempPath}/vector.sketch --output=${tempPath}`, (err, stdout, stderr:) => {
      if (err) throw err;
      console.log(stdout)
      console.log(stderr)
    })
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


export async function processLocalVector(uuid: string, path: string, width: number, height: number) {
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

  var tempPath = fs.mkdtempSync(`${VECTOR_VOLUME}${sep}`);

  try {
    execSync(`sh ${SKETCHTOOL_PROXY} export layers ${path} --item=${uuid} --output=${tempPath} --use-id-for-name`, (err, stdout, stderr) => {
      if (err) throw err;
      console.log(stdout)
      console.log(stderr)
    });
    var readStream = fs.createReadStream(`${tempPath}/${uuid}.png`)
    return readStream
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
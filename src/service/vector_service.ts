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


export default async function wrapVector(shapeGroup: any) {
  //clean up the temp vectors
  await cleanVectorDir()
  if (!fs.existsSync(VECTOR_VOLUME)) {
    fs.mkdirSync(VECTOR_VOLUME);
  }

  //check platform
  return process.platform == 'darwin' ?
    sketchtoolProcess(shapeGroup) :
    defaultImageProcess(shapeGroup);
}

/**
 * wrapping the shape group into a SketchFile so the sketch tool
 * could be apply to it and extract as PNG.
 * @param shapeGroup - vector that is going to be converted into a SketchFile
 */
async function sketchtoolProcess(shapeGroup: any) {
  console.log(process.platform)
  var sketch = new Sketch()
  var group = new ShapeGroup(shapeGroup)
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
  execSync(`sh ${SKETCHTOOL_PROXY} export artboards ${tempPath}/vector.sketch --output=${tempPath}`, (err, stdout, stderr:) => {
    if (err) throw err
    console.log(stdout)
    console.log(stderr)
  })
  var readStream = fs.createReadStream(`${tempPath}/vector.png`)
  return readStream
}

/**
 * Performs the resizing that reflects the `shapeGroup` on a default picture.
 * NOTE: this method executes because the Sketchtool is unavailable
 */
async function defaultImageProcess(shapeGroup: any) {
  var group = new ShapeGroup(shapeGroup)
  var tempPath = fs.mkdtempSync(`${VECTOR_VOLUME}${sep}`)
  await sharp('./assets/sketchtool-unavailable.png')
    .resize({ height: Math.round(group.frame.height), width: Math.round(group.frame.width) })
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

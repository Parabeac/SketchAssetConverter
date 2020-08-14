import { SKETCHTOOL_PROXY, VECTOR_VOLUME } from '../config/constants'

const fs = require('fs-extra')
const { sep } = require('path')
const del = require('del')
const { exec } = require('child_process')
const { Sketch, Page, Artboard, ShapeGroup } = require('sketch-constructor')

const cleanUpLimit = 3

fs.ensureDirSync(`${VECTOR_VOLUME}`)

/**
 * wrapping the shape group into a SketchFile so the sketch tool
 * could be apply to it and extract as PNG.
 * @param shapeGroup - vector that is going to be converted into a SketchFile
 */
export default async function wrapVector (shapeGroup) {
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
  exec(`sh ${SKETCHTOOL_PROXY} export artboards ${tempPath}/vector.sketch --output=${tempPath}`, (err, stdout, stderr) => {
    if (err) throw err
    console.log(stdout)
    console.log(stderr)
  })
  cleanVectorDir()
}

/**
 * Deletes the directory of the vectors if it reaches the limit on directory size
 */
async function cleanVectorDir () {
  fs.readdir(VECTOR_VOLUME, (err, files) => {
    if (err) throw err
    if (files.length >= cleanUpLimit) {
      del(VECTOR_VOLUME)
    }
  })
  return VECTOR_VOLUME
}

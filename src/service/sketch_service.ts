import { SKETCHTOOL_PROXY, SKETCH_FILE_VOLUME } from '../config/constants'
const { sep } = require('path')

const fs = require('fs-extra')
const { exec } = require('child_process')
/**
 * Getting the preview of the SketchFile
 */
export async function getPreview (path) {
  // FIXME: make temp folder for sketch files.
  // var tempPath = fs.mkdtempSync(`${SKETCH_FILE_VOLUME}${sep}`)
  exec(`sh ${SKETCHTOOL_PROXY} export preview ${path}`, (err, stdout, stderr) => {
    if (err) throw err
    console.log(stdout)
    console.log(stderr)
  })
}

/**
 * Getting the images of the Pages
 */
export default async function getPagesImages (path) {
  console.log('Getting pages')
  exec(`sh ${SKETCHTOOL_PROXY} export artboards ${path}`, (err, stdout, stderr) => {
    if (err) throw err
    console.log(stdout)
    console.log(stderr)
  })
}

/**
 * Extracting all the images from the sketch file.
 */
export async function allImages () {
  
}

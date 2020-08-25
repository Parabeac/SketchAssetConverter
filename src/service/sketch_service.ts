/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-var-requires */
import { SKETCHTOOL_PROXY } from '../config/constants'

const { exec } = require('child_process')
/**
 * Getting the preview of the SketchFile
 */
export async function getPreview(path: string) {
  // FIXME: make temp folder for sketch files.
  // var tempPath = fs.mkdtempSync(`${SKETCH_FILE_VOLUME}${sep}`)
  exec(`sh ${SKETCHTOOL_PROXY} export preview ${path}`, (err: any, stdout: any, stderr: any) => {
    if (err) throw err
    console.log(stdout)
    console.log(stderr)
  })
}

/**
 * Getting the images of the Pages
 */
export default async function getPagesImages(path: string) {
  console.log('Getting pages')
  exec(`sh ${SKETCHTOOL_PROXY} export artboards ${path}`, (err: any, stdout: any, stderr: any) => {
    if (err) throw err
    console.log(stdout)
    console.log(stderr)
  })
}

/**
 * Extracting all the images from the sketch file.
 */
export async function allImages() {
}

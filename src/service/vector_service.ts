import * as SketchFile from 'sketch-file'
import fs from 'fs'
import { create } from 'domain'

const { sep } = require('path')
const del = require('del')
const JSZip = require('jszip')

const vectorPath = './assets/vector/'

/**
 * wrapping the shape group into a SketchFile so the sketch tool
 * could be apply to it and extract as PNG.
 * @param shapeGroup - vector that is going to be converted into a SketchFile
 */
export default function wrapVector (shapeGroup) {
  console.log('Entered function')
  var file = SketchFile.createNewSketchFile()
  // fs.writeFile(vectorPath, 'lyrics', (err) => {
  //   // throws an error, you could also catch it here
  //   if (err) throw err

  //   // success case, the file was saved
  // })
  // createSketchFile('temp vector')
  console.log(file)
  console.log(shapeGroup)
  createSketchFile('doc', 'meta', 'user')
  // cleanVectorDir()
}

async function createSketchFile (document, meta, user) {
  if (!fs.existsSync(vectorPath)) {
    fs.mkdir(vectorPath, (err) => {
      if (err) throw err
    })
  }
  // Create the vector parent directory.
  fs.mkdtemp(`${vectorPath}${sep}`, async (err, directory) => {
    if (err) throw err
    console.log(directory)

    // Creating the essential sketch file
    var zip = new JSZip()
    await createAndZipFile(directory + '/document.json', document, zip)
    await createAndZipFile(directory + '/meta.json', meta, zip)
    await createAndZipFile(directory + '/user.json', user, zip)
    await createAndZipFile(directory + '/pages', null, zip, true)

    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream(directory + '/vector.sketch'))
  })
}

async function createFile (filePath, fileData, isDirectory = false) {
  isDirectory
    ? fs.mkdir(filePath, (err) => {
      if (err) throw err
    })
    : fs.writeFile(filePath, fileData, (err) => {
      if (err) throw err
    })
}

async function createAndZipFile (filePath, fileData, zip, isDirectory = false) {
  await createFile(filePath, fileData, isDirectory)
  isDirectory ? zip.file(filePath) : zip.folder(filePath)
}

/**
 * Deleting the assets folder for the vectors
 */
async function cleanVectorDir () {
  del(vectorPath)
  fs.mkdir(vectorPath, (err) => {
    if (err) throw err
    console.log('created the vector folder')
  })
  return vectorPath
}

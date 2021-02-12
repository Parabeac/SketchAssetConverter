/**
 * Port of the Expresss server
 */
export const PORT = process.env.PORT || 4000

/**
 * All commands to the sketch tool should be passed through this script, which
 * finds the SketchTool within the system.
 */
export const SKETCHTOOL_PROXY = './scripts/sketchtool_proxy.sh'

/**
 * Path where the temp. data of the vectors are saved.
 */
export const VECTOR_VOLUME = './dist/vector_volumes'

/**
 * Path where the temp. data of the vectors are saved.
 */
export const SKETCH_FILE_VOLUME = './dist/sketch_files'

/* 
    Command to zip up the files and make it a sketch file
*/
export const ZIP_SKETCH_COMMAND =
    "zip -r -X modFile.sketch images pages previews text-previews document.json meta.json user.json ";
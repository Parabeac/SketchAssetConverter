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

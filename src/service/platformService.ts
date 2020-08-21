
const process = require('process');

export default async function platformSupported(): Promise<boolean> {

    //check platform
    return process.platform == 'darwin';

    //Check if sketch is installed, 
}
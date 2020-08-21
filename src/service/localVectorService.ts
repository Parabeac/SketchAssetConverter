import platformSupported './platformService'

export default async function extractItem(uuid: string, path: string) {
    //check platform
    if (platformSupported()) {
        execSync(`sh ${SKETCHTOOL_PROXY} export artboards ${tempPath}/vector.sketch --output=${tempPath}`, (err, stdout, stderr:) => {
            if (err) throw err
            console.log(stdout)
            console.log(stderr)
        })
    }
}
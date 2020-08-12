class SketchFile {
    file
    fileName
    projectUUID
    UUID
    pages

    constructor(file:File, fileName:string, projectUUID:string, UUID:string, pages) { 
        this.file = file
        this.fileName = fileName
        this.projectUUID = projectUUID
        this.UUID = UUID
        this.pages = pages
     } 
}

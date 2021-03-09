export default class Error {
    public code: string
    public title: string
    public description: string

    constructor(error: Record<string, string>) {
        this.code = error.code
        this.title = error.title
        this.description = error.description
    }
}
export default class Series {
    public code: string
    public name: string
    public logoURL: string

    constructor(data: Record<string, string>) {
        this.code = data.code
        this.name = data.title
        this.logoURL = `https://orla.pro/assets/series/${data.image}.png`
    }
}
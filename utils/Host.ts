import Series from './Series'

type Snowflake = string

export default class Host {
    public code: string
    public name: string
    public emoji: Snowflake
    public color: string
    public logoURL: string
    public series: Record<string, Series> | null

    constructor(data: Record<string, string>) {
        this.name = data.title
        this.code = data.name
        this.emoji = data.emoji
        this.color = data.color
        this.logoURL = `https://orla.pro/assets/hosts/${data.name}.png`
        this.series = (data.series) ? (() => {
            const series: Record<string, Series> = {}
            data.series = JSON.parse(data.series)
            Object.entries(data.series).forEach(([code, {title, image}]: Array<any>) => {
                series[code] = new Series({code, title, image})
            })
            return series
        })() : null
    }
}
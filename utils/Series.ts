import Client from './Client'

export default class Series {
    public code: string
    public name: string
    public logoURL: string

    constructor(client: Client, hostCode: string, seriesCode: string) {
        const series = client.hosts[hostCode].series[seriesCode]
        this.code = seriesCode
        this.name = series.title
        this.logoURL = `https://orla.pro/assets/series/${series.image}.png`
    }
}
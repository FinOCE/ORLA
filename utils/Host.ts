import Client from './Client'
import Series from './Series'

export default class Host {
    public code: string
    public name: string
    public emoji: string
    public color: string
    public logoURL: string
    public series: Record<string, Series> | null

    constructor(client: Client, code: string) {
        const host = client.hosts[code]
        this.name = host.title
        this.code = host.name
        this.emoji = host.emoji
        this.color = host.color
        this.logoURL = `https://orla.pro/assets/hosts/${host.name}.png`
        this.series = (host.series) ? (() => {
            const series: Record<string, Series> = {}
            Object.keys(host.series).forEach((s: string) => {series[s] = new Series(client, host.name, s)})
            return series
        })() : null
    }
}
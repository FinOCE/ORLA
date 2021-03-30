import {GuildEmoji} from 'discord.js'
import Client from './Client'
import {Mode} from './Stat'

export default class Rank {
    private client: Client
    public emote: GuildEmoji
    public name: string
    public division: {
        name: string,
        value: number,
        deltaUp: number | undefined,
        deltaDown: number | undefined,
        estimated: boolean | undefined
    }
    public mmr: number

    constructor(client: Client, mode: Mode) {
        const rankNames = [
            'Unranked',
            'Bronze',
            'Silver',
            'Gold',
            'Platinum',
            'Diamond',
            'Champion',
            'Grand Champion',
            'Supersonic Legend'
        ]
        const ranks: Array<Record<string, string>> = []
        rankNames.forEach(rank => {
            if (['Unranked', 'Supersonic Legend'].indexOf(rank) !== -1) {
                ranks.push({
                    name: rank,
                    emote: `${(ranks.length < 10) ? '0' : ''}${ranks.length}_${rank.toLowerCase().replace(/ +/g, '')}`
                })
            } else {
                ['I', 'II', 'III'].forEach((value, i) => {
                    ranks.push({
                        name: `${rank} ${value}`,
                        emote: `${(ranks.length < 10) ? '0' : ''}${ranks.length}_${rank.toLowerCase().replace(/ +/g, '')}${i+1}`
                    })
                })
            }
        })
        
        this.client = client
        this.emote = this.client.guilds.cache
            .find(g => g.id === this.client.config.mainServer)!
            .emojis.cache
            .find(e => e.name === ranks.find(rank => rank.name === mode.rank)!.emote)!
        this.name = mode.rank
        this.division = {
            name: mode.division.name,
            value: mode.division.value,
            deltaUp: mode.division.up,
            deltaDown: mode.division.down,
            estimated: mode.division.estimated
        }
        this.mmr = mode.mmr
    }
}
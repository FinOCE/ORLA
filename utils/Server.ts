import Client from './Client'
import {Snowflake} from 'discord.js'

export default class Server {
    public id: Snowflake
    public prefix: string
    public timezone: string
    public upcoming: Record<string, Snowflake>
    public announcements: Snowflake
    public notifications: Snowflake
    public joinleave: Record<string, Snowflake>
    public afk: Snowflake
    public autorole: Array<Snowflake>
    public manualrole: Record<string, Snowflake>
    public pingrole: Snowflake
    public xproles: Array<Snowflake>
    public rankroles: Array<Snowflake>
    public stateroles: Record<string, Snowflake>

    constructor(client: Client, data: Record<string, string>) {
        this.id = data.id
        this.prefix = data.prefix ?? client.config.prefix
        this.timezone = data.timezone
        this.upcoming = JSON.parse(data.upcoming)
        this.announcements = data.announcements
        this.notifications = data.notifications
        this.joinleave = JSON.parse(data.joinleave)
        this.afk = data.afk
        this.autorole = JSON.parse(data.autorole)
        this.manualrole = JSON.parse(data.manualrole)
        this.pingrole = data.pingrole
        this.xproles = JSON.parse(data.xproles)
        this.rankroles = JSON.parse(data.rankroles)
        this.stateroles = JSON.parse(data.stateroles)
    }
}
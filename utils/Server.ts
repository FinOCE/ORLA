import Client from './Client'

type Snowflake = string

export default class Server {
    public id: Snowflake
    public timezone: string
    public upcoming: Record<string, Snowflake>
    public announcements: Snowflake
    public notifications: Snowflake
    public joinleave: Record<string, Snowflake>
    public autorole: Array<Snowflake>
    public manualrole: Record<string, Snowflake>
    public pingrole: Snowflake
    public xproles: Array<Snowflake>
    public rankroles: Array<Snowflake>
    public stateroles: Record<string, Snowflake>

    constructor(data: Record<string, string>) {
        this.id = data.id
        this.timezone = data.timezone
        this.upcoming = JSON.parse(data.upcoming)
        this.announcements = data.announcements
        this.notifications = data.notifications
        this.joinleave = JSON.parse(data.joinleave)
        this.autorole = JSON.parse(data.autorole)
        this.manualrole = JSON.parse(data.manualrole)
        this.pingrole = data.pingrole
        this.xproles = JSON.parse(data.xproles)
        this.rankroles = JSON.parse(data.rankroles)
        this.stateroles = JSON.parse(data.stateroles)
    }
}
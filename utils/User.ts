import {Message, User as UserJS, Snowflake} from 'discord.js'

import Client from './Client'

export default class User {
    private client: Client
    public id: Snowflake | undefined
    public containsDiscordData: boolean
    public containsDatabaseData: boolean
    // Retrieved from Discord
    public discord: {
        username: Snowflake | undefined
        discriminator: string | undefined
        bot: boolean | undefined
        avatarURL: string | null | undefined
        createdAt: Date | undefined
    }
    // Retrieved from the database
    public location: string | undefined
    public timezone: string | undefined
    public platforms: {
        main: string | undefined
        steam: string | undefined
        epic: string | undefined
        ps: string | undefined
        xbox: string | undefined
    }
    public orla: {
        nick: string | undefined
        url: string | undefined
        xp: {
            total: number | undefined
            level: number | undefined
            progress: {
                remaining: number | undefined
                cost: number | undefined
            }
            giveFromMessage: () => Promise<void>
            giveFromVoice: () => Promise<void>
            give: (amount: number) => void
            take: (amount: number) => void
            set: (amount: number) => void
            update: (message: Message) => void
        }
    }

    constructor(client: Client, database: Record<string, any> | undefined, discord: UserJS | undefined) {
        // Variables for XP
        let level: number | undefined,
            cost: number | undefined,
            remaining: number | undefined,
            total: number | undefined
        // Variable for timezone
        let timezone: string | undefined

        if (database) {
            // Determine XP stats if database is valid
            if (database.xp) {
                level = 0
                cost = 100
                remaining = Number(database.xp)
                total = Number(database.xp)

                while (cost < remaining) {
                    remaining -= cost
                    level += 1
                    cost = 5*(level*level) + 50*level + 100
                }
            }

            // Determine timezone if database is valid
            const timezones: Record<string, string> = {
                qld: 'Australia/Brisbane',
                nsw: 'Australia/Sydney',
                nt: 'Australia/Darwin',
                wa: 'Australia/Perth',
                sa: 'Australia/Adelaide',
                vic: 'Australia/Melbourne',
                act: 'Australia/Canberra',
                tas: 'Australia/Hobart',
                nz: 'Oceania/Auckland'
            }
            timezone = (database.location) ? timezones[database.location.toLowerCase()] : undefined
        }

        this.client = client
        this.id = discord?.id ?? database?.id
        const id = this.id
        this.containsDiscordData = (discord !== undefined)
        this.containsDatabaseData = (database !== undefined)
        // Retrieved from Discord
        this.discord = {
            username: discord?.username,
            discriminator: discord?.discriminator,
            bot: discord?.bot,
            avatarURL: discord?.avatarURL(),
            createdAt: discord?.createdAt
        }
        // Retrieved from the database
        this.location = database?.location
        this.timezone = timezone
        this.platforms = {
            main: database?.main,
            steam: database?.steam,
            epic: database?.epic,
            ps: database?.ps,
            xbox: database?.xbox
        }
        this.orla = {
            nick: database?.nick,
            url: (database?.url) ? `https://orla.pro/${database.url}` : undefined,
            xp: {
                total: total,
                level: level,
                progress: {
                    remaining: remaining,
                    cost: cost
                },
                async giveFromMessage() {
                    if ((await client.query('SELECT `xp` FROM `users` WHERE `id`="'+id+'"'))?.getFirst() === undefined) client.query('INSERT INTO `users` (`id`, `xp`) VALUES("'+id+'", 0)')
                    client.query('UPDATE `users` SET `xp`=`xp`+'+Math.floor(Math.random()*11 + 15)+' WHERE `id`="'+id+'"')
                },
                async giveFromVoice() {
                    if ((await client.query('SELECT `xp` FROM `users` WHERE `id`="'+id+'"'))?.getFirst() === undefined) client.query('INSERT INTO `users` (`id`, `xp`) VALUES("'+id+'", 0)')
                    client.query('UPDATE `users` SET `xp`=`xp`+'+Math.floor(Math.random()*6 + 5)+' WHERE `id`="'+id+'"')
                },
                give(amount: number) {
                    client.query('UPDATE `users` SET `xp`=`xp`+'+amount+' WHERE `id`="'+id+'"')
                },
                take(amount: number) {
                    client.query('UPDATE `users` SET `xp`=`xp`-'+amount+' WHERE `id`="'+id+'"')
                },
                set(amount:number) {
                    client.query('UPDATE `users` SET `xp`='+amount+' WHERE `id`="'+id+'"')
                },
                update(message: Message) {
                    const xproles = client.servers[message.guild!.id].xproles
                    if (level && xproles !== null && level >= 5) {
                        if (level >= 10 && level < 35) message.member!.roles.remove(xproles[Math.floor(level/5)-2])
                        if (level < 35) message.member!.roles.add(xproles[Math.floor(level/5)-1])
                    }
                }
            }
        }
    }
    static async build(client: Client, id: Snowflake) {
        const database: Record<string, any> | undefined = (await client.query('SELECT * FROM `users` WHERE `id`="'+id+'"'))?.getFirst()
        const discord: UserJS | undefined = await client.users.fetch(id).catch(err => {return undefined})
        return new User(client, database, discord)
    }
}
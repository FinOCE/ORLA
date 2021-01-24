module.exports.User = class User {
    constructor(json) {
        Object.keys(json).forEach(p => this[p] = json[p])
    }
    static async build(client, id) {
        let sql = await client.query('SELECT * FROM `users` WHERE `id`="'+id+'"')
        sql = sql.getFirst()
        const discord = await client.users.fetch(id)

        if (typeof sql !== 'undefined') {
            let level = 0, cost = 100, remaining = sql.xp, total = sql.xp
            while (cost < remaining) {
                remaining -= cost
                level += 1
                cost = 5*(level*level) + 50*level + 100
            }
            
            const timezones = {
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

            const timezone = (sql.location !== null) ? sql.location.toLowerCase() : null

            return new User({
                id: discord.id,
                location: sql.location,
                timezone: timezone,
                platforms: {
                    main: sql.main,
                    steam: sql.steam,
                    ps: sql.ps,
                    xbox: sql.xbox
                },
                orla: {
                    nick: sql.nick,
                    url: (sql.url !== null) ? `https://orla.pro/${sql.url}` : null,
                    xp: {
                        total: total,
                        level: level,
                        progress: {
                            remaining: remaining,
                            cost: cost
                        },
                        give(amount) {client.query('UPDATE `users` SET `xp`=`xp`+'+amount+' WHERE `id`="'+sql.id+'"')},
                        take(amount) {client.query('UPDATE `users` SET `xp`=`xp`-'+amount+' WHERE `id`="'+sql.id+'"')},
                        set(amount) {client.query('UPDATE `users` SET `xp`='+amount+' WHERE `id`="'+sql.id+'"')}
                    },
                    gotw: {
                        vote: sql.vote
                    }
                },
                discord: {
                    username: discord.username,
                    discriminator: discord.discriminator,
                    bot: discord.bot,
                    avatarURL: discord.avatarURL(),
                    createdAt: discord.createdAt
                }
            })
        } else {
            return new User({
                id: discord.id,
                discord: {
                    username: discord.username,
                    discriminator: discord.discriminator,
                    bot: discord.bot,
                    avatarURL: discord.avatarURL()
                }
            })
        }
    }
    Experience() {
        const {Experience} = require('./Experience')
        return new Experience(this)
    }
}
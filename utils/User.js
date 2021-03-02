module.exports.User = class User {
    constructor(data) {
        // Set properties from data to the object
        Object.keys(data).forEach(p => this[p] = data[p])
    }
    static async build(client, id) {
        // Get user information from Discord and database
        const discord = await client.users.fetch(id)
        const sql = (await client.query('SELECT * FROM `users` WHERE `id`="'+id+'"')).getFirst()

        // Return new User object built from information sourced above
        return new User(await new Promise((resolve, reject) => {
            // Set Discord-sourced data
            const user = {
                id: discord.id,
                discord: {
                    username: discord.username,
                    discriminator: discord.discriminator,
                    bot: discord.bot,
                    avatarURL: discord.avatarURL(),
                    createdAt: discord.createdAt
                }
            }
            
            // Set database-sourced data if applicable
            if (typeof sql !== 'undefined') {
                // Calculate XP level and other relevant values
                let level = 0, cost = 100, remaining = sql.xp, total = sql.xp
                while (cost < remaining) {
                    remaining -= cost
                    level += 1
                    cost = 5*(level*level) + 50*level + 100
                }

                // Find timezone from state
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
                const timezone = (sql.location !== null) ? timezones[sql.location.toLowerCase()] : null
                
                // Assign database-sourced data to the same object as Discord-sourced data
                Object.assign(user, {
                    location: sql.location,
                    timezone: timezone,
                    platforms: {
                        main: sql.main,
                        steam: sql.steam,
                        epic: sql.epic,
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
                            async giveFromMessage() {
                                if ((await client.query('SELECT `xp` FROM `users` WHERE `id`="'+sql.id+'"')).getFirst() === undefined) client.query('INSERT INTO `users` (`id`, `xp`) VALUES("'+sql.id+'", 0)')
                                client.query('UPDATE `users` SET `xp`=`xp`+'+Math.floor(Math.random()*11 + 15)+' WHERE `id`="'+sql.id+'"')
                            },
                            async giveFromVoice() {
                                if ((await client.query('SELECT `xp` FROM `users` WHERE `id`="'+sql.id+'"')).getFirst() === undefined) client.query('INSERT INTO `users` (`id`, `xp`) VALUES("'+sql.id+'", 0)')
                                client.query('UPDATE `users` SET `xp`=`xp`+'+Math.floor(Math.random()*6 + 5)+' WHERE `id`="'+sql.id+'"')
                            },
                            give(amount) {client.query('UPDATE `users` SET `xp`=`xp`+'+amount+' WHERE `id`="'+sql.id+'"')},
                            take(amount) {client.query('UPDATE `users` SET `xp`=`xp`-'+amount+' WHERE `id`="'+sql.id+'"')},
                            set(amount) {client.query('UPDATE `users` SET `xp`='+amount+' WHERE `id`="'+sql.id+'"')},
                            update(message) {
                                const xproles = client.servers[message.guild.id].xproles
                                if (xproles !== null && level >= 5) {
                                    if (level >= 10 && level < 35) message.member.roles.remove(xproles[Math.floor(level/5)-2])
                                    if (level < 35) message.member.roles.add(xproles[Math.floor(this.level/5)-1])
                                }
                            }
                        }
                    }
                })
            }

            // Resolve promise to create User object
            resolve(user)
        }))
    }
}
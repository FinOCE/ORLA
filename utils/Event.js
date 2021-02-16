module.exports.Event = class Event {
    // ----- Setup -----
    constructor(client, json={}) {
        this.client = client
        Object.keys(json).forEach(p => this[p] = json[p])
    }
    static async build(client, sql) {
        const event = {}

        // Define host and series for cleaner code
        const host = client.hosts[sql.host]
        const series = host.series[sql.series]
        
        // Add series info if provided
        if (sql.series !== null) {
            event.series = {
                code: sql.series,
                name: series.title,
                imageURL: `https://orla.pro/assets/series/${series.image}.png`
            }
        } else {
            event.series = null
        }

        // Add host info
        event.host = {
            code: host.name,
            name: host.title,
            emoji: host.emoji,
            color: host.color,
            logoURL: `https://orla.pro/assets/hosts/${host.name}.png`
        }

        // Add other information about the event
        Object.assign(event, {
            name: sql.title,
            URL: sql.link,
            customURL: `https://orla.pro/events/${sql.redirect}`,
            open: (sql.topen === 1),
            mode: sql.mode,
            prize: sql.prize,
            announced: sql.announced,
            reminded: sql.reminded,
            startTime: sql.ttime,
            registrationTime: sql.rtime
        })

        return new Event(client, event)
    }

    // ----- Queries -----
    isAnnounced() {
        return (this.announced === 1)
    }
    isNotified() {
        return (this.reminded === 1)
    }
    getUpcomingTitle(icon) {
        return `${icon} **\`${this.name}\`**`
    }
    getUpcomingMessage(server) {
        const moment = require('moment-timezone')
        const momentDurationFormatSetup = require('moment-duration-format')

        const stream = (this.streamURL !== null) ? ` | [View Stream](${this.streamURL})` : ''

        return '​'
            +`    [Registration Page](${this.customURL})${stream}\n\n`
            +`    Event Starts: **${moment.unix(this.startTime).tz(server.timezone).format('dddd Do MMMM h:mma')}**\n`
            +`    Rego Closes: **${moment.unix(this.registrationTime).tz(server.timezone).format('h:mma')}** (*${moment.duration(Math.round(this.registrationTime - moment().unix()), "seconds").format('D[d] H[hr] m[min]')}*)\n`
            +`    Format: **${this.mode}**\n`
            +`    Prize: **${this.prize}**\n`
    }

    // ----- Actions -----
    announce(client) {
        const Discord = require('discord.js')
        const moment = require('moment-timezone')

        client.servers.forEach(server => {
            if (server.announcements !== null) {
                const Embed = new Discord.MessageEmbed()
                    .setColor(this.host.color)
                    .setTitle(`\`${this.name}\``)
                    .setURL(this.customURL)
                    .setAuthor(this.host.name, this.host.logoURL)
                    .setFooter('Tournament information provided by https://orla.pro', client.config.logo)
                    .setThumbnail((this.series !== null) ? this.series.imageURL : this.host.logoURL)
                    .addField(`📋 **__Tournament Details__**`, 
                        `${(this.series !== null) ? `Series: **${this.series.name}**\n` : ''}`
                        +`Mode: **${this.mode}**\nPrize Pool: **${this.prize}**\n\n`)
                    .addField('🔗 **__Links__**',
                        `*You can enter this tournament by registering at:*\n➡️** ${this.customURL} **`
                        +`${(this.open) ? '' : '\n\n⚠️ ***Registration requires an invite***'}`
                        +`${(this.streamURL === null) ? '' : `\n\n*You can watch this tournament's live stream at:*\n➡️** ${this.streamURL} **`}`)
                    .addField('🕐 **__Schedule__**',
                        `\`\`\`http\nTournament Date:   ${moment.unix(this.startTime).tz(server.timezone).format('dddd Do MMMM')}`
                        +`\nRegistration Ends: ${moment.unix(this.registrationTime).tz(server.timezone).format('h:mma z')}`
                        +`\nTournament Starts: ${moment.unix(this.startTime).tz(server.timezone).format('h:mma z')}\n\`\`\``)
                
                try {
                    const channel = client.channels.cache.find(c => c.id === server.announcements)
                    channel.send(`<@&${(server.pingrole !== null) ? server.pingrole : ''}>`, Embed).then(message => {
                        if (message.channel.type === 'news') message.crosspost()
                    })
                } catch(err) {
                    console.log(err)
                }
            }
        })

        client.query('UPDATE `tournaments` SET `announced`=1 WHERE `title`="'+this.name+'"')
    }
    notify(client) {
        const Discord = require('discord.js')
        const moment = require('moment-timezone')

        client.servers.forEach(server => {
            if (server.notifications !== null) {
                const Embed = new Discord.MessageEmbed()
                    .setColor(this.host.color)
                    .setTitle(`\`${this.name}\``)
                    .setURL(this.customURL)
                    .setAuthor(this.host.name, this.host.logoURL)
                    .setFooter('Tournament information provided by https://orla.pro', client.config.logo)
                    .setThumbnail((this.series !== null) ? this.series.imageURL : this.host.logoURL)
                    .setDescription(
                        '```fix\nREGISTRATION CLOSES IN ONE HOUR\n```\nRegistration for this tournament closes at **'
                        +moment.unix(this.registrationTime).tz(server.timezone).format('h:mma z')
                        +'**. To register or watch the tournament, follow the links below. The tournament starts at **'
                        +moment.unix(this.startTime).tz(server.timezone).format('h:mma z')+'**.')
                    .addField('🔗 **__Links__**',
                        `*You can enter this tournament by registering at:*\n➡️** ${this.customURL} **`
                        +`${(this.open) ? '' : '\n\n⚠️ ***Registration requires an invite***'}`
                        +`${(this.streamURL === null) ? '' : `\n\n*You can watch this tournament's live stream at:*\n➡️** ${this.streamURL} **`}`)
                try {
                    const channel = client.channels.cache.find(c => c.id === server.notifications)
                    channel.send(`<@&${(server.pingrole !== null) ? server.pingrole : ''}>`, Embed).then(message => {
                        if (message.channel.type === 'news') message.crosspost()
                    })
                } catch(err) {
                    console.log(err)
                }
            }
        })

        client.query('UPDATE `tournaments` SET `reminded`=1 WHERE `title`="'+this.name+'"')
    }
    async query(message, question) {
        if (this.cancelled !== false) {
            return new Promise((resolve, reject) => {
                if (question) message.channel.send(question)

                const collecter = message.channel.createMessageCollector(m => m.author.id === message.author.id, {time: 300000})
                collecter.on('collect', m => {
                    collecter.stop()

                    if (m.content === '.cancel') {
                        this.cancelled = true
                        message.channel.send('Upload cancelled.')
                        return
                    }

                    resolve(m.content)
                })
            })
        }
    }
}
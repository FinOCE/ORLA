module.exports.Event = class Event {
    // ----- Setup -----
    constructor(client, json={}) {
        this.client = client
        Object.keys(json).forEach(p => this[p] = json[p])
    }
    static async build(client, sql) {
        this.client = client
        const json = {}

        let series = await this.client.sql('SELECT `series` FROM `hosts` WHERE `name`="'+sql[0].host+'"')
        json.series = {
            code: sql[0].series,
            name: JSON.parse(series[0].series)[sql[0].series].title,
            imageURL: `https://orla.pro/assets/series/${JSON.parse(series[0].series)[sql[0].series].image}.png`
        }

        let host = await this.client.sql('SELECT * FROM `hosts` WHERE `name`="'+sql[0].host+'"')
        json.host = {
            code: host[0].name,
            name: host[0].title,
            emoji: host[0].emoji,
            color: host[0].color,
            series: JSON.parse(series[0].series),
            logoURL: `https://orla.pro/assets/hosts/${host[0].name}.png`
        }

        json.name = sql[0].title
        json.URL = sql[0].link
        json.customURL = `https://orla.pro/events/${sql[0].redirect}`
        json.streamURL = sql[0].stream
        json.open = (sql[0].topen === 1) ? true : false
        json.mode = sql[0].mode
        json.prize = sql[0].prize
        json.announced = sql[0].announced
        json.reminded = sql[0].reminded

        json.startTime = sql[0].ttime
        json.registrationTime = sql[0].rtime

        return new Event(client, json)
    }

    // ----- Queries -----
    isAnnounced() {
        return (this.announced === 1) ? true : false
    }
    isNotified() {
        return (this.reminded === 1) ? true : false
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
            +`    Rego Closes: **${moment.unix(this.registrationTime).tz(server.timezone).format('h:mma')}** (*${moment.duration(Math.round(this.registrationTime - moment().unix() + 86400*21), "seconds").format('D[d] H[hr] m[min]')}*)\n`
            +`    Format: **${this.mode}**\n`
            +`    Prize: **${this.prize}**\n`
    }

    // ----- Actions -----
    announce(client) {
        const Discord = require('discord.js')
        const moment = require('moment-timezone')

        Object.keys(client.servers).forEach(id => {
            if (client.servers[id].announcements !== null) {
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
                        `\`\`\`http\nTournament Date:   ${moment.unix(this.startTime).tz(client.servers[id].timezone).format('dddd Do MMMM')}`
                        +`\nRegistration Ends: ${moment.unix(this.startTime).tz(client.servers[id].timezone).format('h:mma z')}`
                        +`\nTournament Starts: ${moment.unix(this.startTime).tz(client.servers[id].timezone).format('h:mma z')}\n\`\`\``)
                
                const channel = client.channels.cache.find(c => c.id === client.servers[id].announcements)
                channel.send(`<@&${client.servers[id].pingrole}>`, Embed)
            }
        })

        client.sql('UPDATE `tournaments` SET `announced`=1 WHERE `title`="'+this.name+'"')
    }
    notify(client) {
        const Discord = require('discord.js')
        const moment = require('moment-timezone')

        Object.keys(client.servers).forEach(id => {
            if (client.servers[id].notifications !== null) {
                const Embed = new Discord.MessageEmbed()
                    .setColor(this.host.color)
                    .setTitle(`\`${this.name}\``)
                    .setURL(this.customURL)
                    .setAuthor(this.host.name, this.host.logoURL)
                    .setFooter('Tournament information provided by https://orla.pro', client.config.logo)
                    .setThumbnail((this.series !== null) ? this.series.imageURL : this.host.logoURL)
                    .setDescription(
                        '```fix\nREGISTRATION CLOSES IN ONE HOUR\n```\nRegistration for this tournament closes at **'
                        +moment.unix(this.registrationTime).tz(client.servers[id].timezone).format('h:mma z')
                        +'**. To register or watch the tournament, follow the links below. The tournament starts at **'
                        +moment.unix(this.startTime).tz(client.servers[id].timezone).format('h:mma z')+'**.')
                    .addField('🔗 **__Links__**',
                        `*You can enter this tournament by registering at:*\n➡️** ${this.customURL} **`
                        +`${(this.open) ? '' : '\n\n⚠️ ***Registration requires an invite***'}`
                        +`${(this.streamURL === null) ? '' : `\n\n*You can watch this tournament's live stream at:*\n➡️** ${this.streamURL} **`}`)

                const channel = client.channels.cache.find(c => c.id === client.servers[id].notifications)
                channel.send(`<@&${client.servers[id].pingrole}>`, Embed)
            }
        })

        client.sql('UPDATE `tournaments` SET `reminded`=1 WHERE `title`="'+this.name+'"')
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
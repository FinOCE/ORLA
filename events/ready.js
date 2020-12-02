module.exports = async (client) => {
    const Discord = require('discord.js')
    const moment = require('moment-timezone')

    // Set status and show the bot is running
    console.log('Bot is now online')
    client.user.setActivity('orla.pro | .help', {type: 'WATCHING'})

    // Execute functions on an interval
    client.setInterval(function update() {
        (async () => {
            // Create server list
            const servers = await client.query('SELECT * FROM `servers`')
            servers.getAll().forEach(server => {
                server.upcoming = JSON.parse(server.upcoming)
                server.autorole = JSON.parse(server.autorole)
                server.rankroles = JSON.parse(server.rankroles)
            })
            client.servers = servers.getAll()

            // Get hosts
            const hosts = await client.query('SELECT * FROM `hosts`')
            hosts.getAll().forEach(host => host.series = JSON.parse(host.series))
            client.hosts = hosts.getAll()

            // Upcoming
            {
                const events = await client.query('SELECT * FROM `tournaments` WHERE `ttime`>'+moment().unix())
                events.getAll().sort((a, b) => {return a.ttime - b.ttime})

                Object.keys(client.servers).forEach(async i => {
                    const server = client.servers[i]

                    const hours = Math.floor(moment.tz(server.timezone).utcOffset() / 60)
                    const minutes = (moment.tz(server.timezone).utcOffset() % 60 > 0) ? `:${moment.tz(server.timezone).utcOffset() % 60}` : ''
                    const offset = (hours >= 0) ? `+${hours}${minutes}` : `${hours}${minutes}`

                    const Embed = new Discord.MessageEmbed()
                        .setColor(client.config.color)
                        .setTitle(`**Upcoming Tournaments - ${moment.tz(server.timezone).format('z')} (${offset})**`)
                        .setURL('https://orla.pro')
                        .setFooter('Last Updated')
                        .setTimestamp()
                    
                    events.getAll().forEach(async eventData => {
                        const icon = client.emojis.cache.get(client.hosts.find(host => host.name === event.host.code).emoji)

                        const {Event} = require('../utils/Event')
                        const event = await Event.build(client, [eventData])
                        Embed.addField(event.getUpcomingTitle(icon), event.getUpcomingMessage(server))
                    })

                    if (events.getAll().length === 0) Embed.setDescription('Unfortunately no events have been announced yet.')

                    client.channels.cache.get(server.upcoming.channelID).messages.fetch(server.upcoming.messageID).then(msg => msg.edit(Embed))
                })
            }

            // Announcements
            {
                const events = await client.query('SELECT * FROM `tournaments` WHERE `announced`=0')

                Object.keys(client.servers).forEach(async i => {
                    const server = client.servers[i]

                    events.getAll().forEach(async eventData => {
                        const {Event} = require('../utils/Event')
                        const event = await Event.build(client, [eventData])

                        const open = (event.open) ? '' : '\n\n⚠️ ***Registration requires an invite***'
                        const stream = (event.streamURL === null) ? '*Unfortunately this tournament is not planned to be streamed.*' : `*You can watch this tournament's live stream at:*\n➡️** ${event.stream} **`
                        const thumbnail = (event.series.imageURL !== null) ? event.series.imageURL : event.host.logoURL
                        const series = (event.series.name !== null) ? `Series: **${event.series.name}**\n` : ''

                        const Embed = new Discord.MessageEmbed()
                            .setColor(client.config.color)
                            .setTitle(`**\`${event.name}\`**`)
                            .setURL('https://orla.pro')
                            .setAuthor(event.host.name, event.host.logoURL)
                            .setFooter('Tournament information provided by https://orla.pro', client.config.logo)
                            .addField(`📋 **__Tournament Details__**`, `${series}Mode: **${event.mode}**\nPrize Pool: **${event.prize}**\n\n`)
                            .addField('🔗 **__Links__**', `*You can enter this tournament by registering at:*\n➡️** ${event.URL} **${open}\n\n${stream}`)
                            .addField('🕐 **__Schedule__**',
                                `\`\`\`http\nTournament Date:   ${moment.unix(event.startTime).tz(server.timezone).format('dddd Do MMMM')}`
                                +`\nRegistration Ends: ${moment.unix(event.registrationTime).tz(server.timezone).format('h:mma z')}`
                                +`\nTournament Starts: ${moment.unix(event.startTime).tz(server.timezone).format('h:mma z')}\n\`\`\``)
                            .setThumbnail(thumbnail)
                        
                        client.channels.cache.get(server.announcements).send(Embed)
                    })
                })
            }
        })()

        return update
    }(), client.config.timeout * 1000)
}
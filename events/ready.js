module.exports = async (client) => {
    const Discord = require('discord.js')
    const moment = require('moment-timezone')

    // Set status and show the bot is running
    console.log('Bot is now online')
    client.user.setActivity('orla.pro | .help', {type: 'WATCHING'})

    // Execute functions on an interval
    client.setInterval(function update() {
        (async () => {
            const {Event} = require('../utils/Event')

            // Create server list
            const servers = await client.query('SELECT * FROM `servers`')
            servers.getAll().forEach(server => {
                server.upcoming = JSON.parse(server.upcoming)
                server.autorole = JSON.parse(server.autorole)
                server.xproles = JSON.parse(server.xproles)
                server.rankroles = JSON.parse(server.rankroles)
                server.manualrole = JSON.parse(server.manualrole)
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
                    if (server.upcoming !== null) {
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
                            const event = await Event.build(client, [eventData])
                            
                            const icon = client.emojis.cache.get(client.hosts.find(host => host.name === event.host.code).emoji)
                            Embed.addField(event.getUpcomingTitle(icon), event.getUpcomingMessage(server))
                        })

                        if (events.getAll().length === 0) Embed.setDescription('Unfortunately no events have been announced yet.')

                        client.channels.cache.get(server.upcoming.channelID).messages.fetch(server.upcoming.messageID).then(msg => msg.edit(Embed))
                    }
                })
            }

            // Announcements
            {
                const events = await client.query('SELECT * FROM `tournaments` WHERE `announced`=0')

                events.getAll().forEach(async eventData => {
                    const event = await Event.build(client, [eventData])
                    event.announce(client)
                })
            }
            
            // Notifications
            {
                const events = await client.query('SELECT * FROM `tournaments` WHERE `reminded`=0 AND `rtime`<3600+'+moment().unix())

                events.getAll().forEach(async eventData => {
                    const event = await Event.build(client, [eventData])
                    event.notify(client)
                })
            }
        })()

        return update
    }(), client.config.timeout * 1000)
}
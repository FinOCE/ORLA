module.exports = async (client) => {
    const Discord = require('discord.js')
    const moment = require('moment-timezone')

    // Start website if on development build
    const isDevBuild = (process.env.dev === 'true')
    if (isDevBuild) require('../website/website')(client)

    // Set status and show the bot is running
    console.log('Bot is now online')
    client.user.setActivity('orla.pro | .help', {type: 'WATCHING'})

    // Set XP timer storage for messages and voice chats
    client.xpFromMessage = []
    client.xpFromVoice = {}

    // Execute functions on an interval
    client.setInterval(function update() {
        (async () => {
            const {Event} = require('../utils/Event')

            // Create client.servers object
            const servers = await client.query('SELECT * FROM `servers`')
            client.servers = {}
            servers.getAll().forEach(server => {
                const valuesToParse = ['upcoming', 'autorole', 'xproles', 'rankroles', 'manualrole', 'stateroles', 'joinleave']
                valuesToParse.forEach(value => {
                    server[value] = JSON.parse(server[value])
                })
                client.servers[server.id] = server
            })
            
            // Create client.hosts object
            const hosts = await client.query('SELECT * FROM `hosts`')
            client.hosts = {}
            hosts.getAll().forEach(host => {
                host.series = JSON.parse(host.series)
                client.hosts[host.name] = host
            })

            // Upcoming
            {
                const events = await client.query('SELECT * FROM `tournaments` WHERE `ttime`>'+moment().unix())
                events.getAll().sort((a, b) => {return a.ttime - b.ttime})

                Object.values(client.servers).forEach(async server => {
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
                            const event = await Event.build(client, eventData)
                            
                            const icon = client.emojis.cache.get(client.hosts[event.host.code].emoji)
                            Embed.addField(event.getUpcomingTitle(icon), event.getUpcomingMessage(server))
                        })

                        if (events.getAll().length === 0) Embed.setDescription('Unfortunately no events have been announced yet.')

                        client.channels.cache.get(server.upcoming.channelID).messages.fetch(server.upcoming.messageID).then(msg => msg.edit(Embed))
                    }
                })
            }
            
            // Announcements
            {
                const events = await client.query('SELECT * FROM `tournaments` WHERE `announced`=0 AND `ttime`>'+moment().unix())

                events.getAll().forEach(async eventData => {
                    const event = await Event.build(client, eventData)
                    event.announce(client)
                })
            }
            
            // Notifications
            {
                const events = await client.query('SELECT * FROM `tournaments` WHERE `reminded`=0 AND `rtime`<3600+'+moment().unix()+' AND `ttime`>'+moment().unix())

                events.getAll().forEach(async eventData => {
                    const event = await Event.build(client, eventData)
                    event.notify(client)
                })
            }
        })()

        return update
    }(), client.config.timeout * 1000)
}
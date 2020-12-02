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

            // Upcoming message
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
                
                const events = await client.query('SELECT * FROM `tournaments` WHERE `ttime`>'+(moment().unix()-86400*21))
                events.getAll().sort((a, b) => {return a.ttime - b.ttime})
                events.getAll().forEach(async eventData => {
                    const icon = client.emojis.cache.get(client.hosts.find(host => host.name === event.host.code).emoji)
                    
                    const {Event} = require('../utils/Event')
                    const event = await Event.build(client, [eventData])
                    Embed.addField(event.getUpcomingTitle(icon), event.getUpcomingMessage(server))
                })

                client.channels.cache.get(server.upcoming.channelID).messages.fetch(server.upcoming.messageID).then(msg => msg.edit(Embed))
            })
        })()

        return update
    }(), client.config.timeout * 1000)
}
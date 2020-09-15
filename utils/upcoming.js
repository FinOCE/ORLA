module.exports = async (client) => {
    const Discord = require('discord.js')
    const moment = require('moment-timezone')
    const momentDurationFormatSetup = require("moment-duration-format")

    const events = await client.sql('SELECT * FROM `tournaments` WHERE `ttime`>'+moment().unix())
    events.sort(function(a, b) {return a.ttime - b.ttime})
    
    for (const id of Object.keys(client.servers)) {
        const Embed = new Discord.MessageEmbed()
            .setColor(client.config.color)
            .setTitle('Upcoming Tournaments')
            .setURL('https://orla.pro')
            .setFooter(`ORLA - Last Updated: ${moment.unix(moment().unix()).tz(client.servers[id].timezone).format('Do MMMM, h:mma z')}`, client.config.logo)
    
        for (const event of events) {
            if (client.hosts[event.host] !== undefined) {
                const icon = client.emojis.cache.get(client.hosts[event.host].emoji)
                const time = moment.unix(event.ttime).tz(client.servers[id].timezone).format('dddd Do MMMM, h:mma z')

                let rtime = ''
                if (moment.unix(event.rtime).tz(client.servers[id].timezone).format('h:mm') !== moment.unix(event.ttime).tz(client.servers[id].timezone).format('h:mm')) {
                    rtimeFormat = (moment.unix(event.rtime).tz(client.servers[id].timezone).format('dddd') === moment.unix(event.ttime).tz(client.servers[id].timezone).format('dddd')) ? 'h:mma z' : 'dddd Do MMMM, h:mma z'
                    rtime = `\nRego Closes:** ${moment.unix(event.rtime).tz(client.servers[id].timezone).format(rtimeFormat)} **`
                }

                const topen = (event.topen === 1) ? 'Yes' : 'No'
                const stream = (event.stream === null) ? '' : `\nStream:** ${event.stream} **`

                let extraText = ''
                if (events[0].title == event.title) {
                    Embed.setDescription('**__Next Tournament__**')
                    extraText += `\n\n**${event.title}** starts in **${moment.duration(Math.round(event.ttime - moment().unix()), "seconds").format('D[d] H[hr] m[min]')}**.`
                }
                if (events.length > 1 && (events[0].title == event.title)) {
                    extraText += '\n\n**__Other Tournaments__**'
                }

                const content = `Time: **${time}**`
                                +rtime
                                +`\nOpen: **${topen}**`
                                +`\nMode: **${event.mode}**`
                                +`\nPrize: **${event.prize}**`
                                +stream
                                +`\nURL:** ${event.link} **`
                                +extraText

                Embed.addField(`${icon} **__${event.title}__**`, content)
            }
        }
        
        client.channels.cache.get(client.servers[id].upcoming).messages.fetch(client.servers[id].message).then(msg => msg.edit(Embed))
    }
}
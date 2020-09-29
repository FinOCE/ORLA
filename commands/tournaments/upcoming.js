module.exports = {
    desc: 'lists upcoming tournament',
	syntax: '',
	async run(message, args) {
        const Discord = require('discord.js')
        const moment = require('moment-timezone')
        const momentDurationFormatSetup = require("moment-duration-format")

        const events = await message.client.sql('SELECT * FROM `tournaments` WHERE `ttime`>'+moment().unix())
        events.sort(function(a, b) {return a.ttime - b.ttime})

        const userSQL = await message.client.sql('SELECT * FROM `users` WHERE `id`="'+message.author.id+'"')
        const timezone = userSQL[0].timezone

        const Embed = new Discord.MessageEmbed()
            .setColor(message.client.config.color)
            .setTitle('Upcoming Tournaments')
            .setURL('https://orla.pro')
            .setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
        
        for (const event of events) {
            if (message.client.hosts[event.host] !== undefined) {
                const icon = message.client.emojis.cache.get(message.client.hosts[event.host].emoji)
                const time = moment.unix(event.ttime).tz(timezone).format('dddd Do MMMM, h:mma z')

                let rtime = ''
                if (moment.unix(event.rtime).tz(timezone).format('h:mm') !== moment.unix(event.ttime).tz(timezone).format('h:mm')) {
                    rtimeFormat = (moment.unix(event.rtime).tz(timezone).format('dddd') === moment.unix(event.ttime).tz(timezone).format('dddd')) ? 'h:mma z' : 'dddd Do MMMM, h:mma z'
                    rtime = `\nRego Closes:** ${moment.unix(event.rtime).tz(timezone).format(rtimeFormat)} **`
                }

                const topen = (event.topen === 1) ? 'Yes' : 'No'
                const stream = (event.stream === null) ? '' : `\nStream:** ${event.stream} **`

                let extraText = ''
                if (events[0].title == event.title) {
                    Embed.setDescription(`This is the upcoming tournaments adjusted for **${timezone.split('/')[1]}** time.\n\n**__Next Tournament__**`)
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

        if (!(0 in events)) Embed.setDescription('Unfortunately no events have been announced yet. Please check again later.')

        message.channel.send(Embed)
    }
}
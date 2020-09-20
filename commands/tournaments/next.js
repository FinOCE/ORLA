module.exports = {
    desc: 'checks details of the next upcoming tournament',
	syntax: '',
	async run(message, args) {
        const Discord = require('discord.js')
        const moment = require('moment-timezone')
        const momentDurationFormatSetup = require("moment-duration-format")

        const events = await message.client.sql('SELECT * FROM `tournaments` WHERE `ttime`>'+moment().unix())
        events.sort(function(a, b) {return a.ttime - b.ttime})

        const userSQL = await message.client.sql('SELECT * FROM `users` WHERE `id`="'+message.author.id+'"')
        const timezone = userSQL[0].timezone

        if (0 in events) {
            const event = events[0]
            if (message.client.hosts[event.host] !== undefined) {
                const defaultImage = 'https://orla.pro/assets/hosts/default.png'

                const data = {
                    series: '',
                    seriesImage: defaultImage,
                }

                data['color'] = (message.client.hosts[event.host].color !== null) ? message.client.hosts[event.host].color : message.client.config.color
                data['logo'] = (message.client.hosts[event.host].log !== null) ? message.client.hosts[event.host].logo : defaultImage
                if (message.client.hosts[event.host].series !== null) {
                    data['series'] = message.client.hosts[event.host].series[event.series].title
                    data['seriesImage'] = `https://orla.pro/assets/series/${message.client.hosts[event.host].series[event.series].image}.png`
                }

                const topen = (event.topen === 1) ? '' : '\n\n⚠️ ***Registration requires an invite***'
                const stream = (event.stream === null) ? '*Unfortunately this tournament is not planned to be streamed.*' : `*You can watch this tournament's live stream at:*\n➡️** ${event.stream} **`    
                const thumbnail = (data['seriesImage'] !== defaultImage) ? data['seriesImage'] : data['logo']
                const series = (data['series'] !== null) ? `Series: **${data['series']}**\n` : ''

                const Embed = new Discord.MessageEmbed()
                    .setColor(data['color'])
                    .setTitle(`Next Tournament: \`${event.title}\``)
                    .setURL(event.link)
                    .setDescription(`There is **${moment.duration(Math.round(event.rtime - moment().unix()), "seconds").format('D[d] H[hr] m[min]')}** until registration closes.`)
                    .setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
                    .setAuthor(message.client.hosts[event.host].title, data['logo'])
                    .setThumbnail(thumbnail)
                    .addField(`📋 **__Tournament Details__**`, `${series}Mode: **${event.mode}**\nPrize Pool: **${event.prize}**\n\n`)
                    .addField('🔗 **__Links__**', `*You can enter this tournament by registering at:*\n➡️** ${event.link} **${topen}\n\n${stream}`)
                    .addField('🕐 **__Schedule__**',
                        `This schedule is adjusted for **${timezone.split('/')[1]}** time.\`\`\`http\nTournament Date:   ${moment.unix(event.ttime).tz(timezone).format('dddd Do MMMM')}`
                        +`\nRegistration Ends: ${moment.unix(event.rtime).tz(timezone).format('h:mma z')}`
                        +`\nTournament Starts: ${moment.unix(event.ttime).tz(timezone).format('h:mma z')}\n\`\`\``)
                message.channel.send(Embed)
            }
        }
    }
}
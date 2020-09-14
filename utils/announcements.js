module.exports = async (client) => {
    const Discord = require('discord.js')
    const moment = require('moment-timezone')

    const events = await client.sql('SELECT * FROM `tournaments` WHERE `announced`=0')

    for (const event of events) {
        const defaultImage = 'https://orla.pro/assets/hosts/default.png'

        const data = {
            series: null,
            seriesImage: defaultImage,
        }
        
        if (client.hosts[event.host] !== undefined) {
            data['color'] = (client.hosts[event.host].color !== null) ? client.hosts[event.host].color : client.config.color
            data['logo'] = (client.hosts[event.host].log !== null) ? client.hosts[event.host].logo : defaultImage
            if (client.hosts[event.host].series !== null) {
                for (const i in client.hosts[event.host].series) {
                    if (event.series === client.hosts[event.host].series[Object.keys(client.hosts[event.host].series)[i]]) {
                        data['series'] = client.hosts[event.host].series[Object.keys(client.hosts[event.host].series)[i]].title
                        data['seriesImage'] = client.hosts[event.host].series[Object.keys(client.hosts[event.host].series)[i]].image
                    }
                }
            }

            const topen = (event.topen === 1) ? '' : '\n\n⚠️ ***Registration requires an invite***'
            const stream = (event.stream === null) ? '*Unfortunately this tournament is not planned to be streamed.*' : `*You can watch this tournament's live stream at:*\n➡️** ${event.stream} **`
            const thumbnail = (data['seriesImage'] !== defaultImage) ? data['seriesImage'] : data['logo']

            const Embed = new Discord.MessageEmbed()
                .setColor(data['color'])
                .setTitle(`\`${event.title}\``)
                .setURL(event.link)
                .setAuthor(client.hosts[event.host].title, data['logo'])
                .setFooter('Tournament information provided by https://orla.pro', client.config.logo)
                .addField(`📋 **__Tournament Details__**`, `${data['series']}Mode: **${event.mode}**\nPrize Pool: **${event.prize}**\n\n`)
                .addField('🔗 **__Links__**', `*You can enter this tournament by registering at:*\n➡️** ${event.link} **${topen}\n\n${stream}`)
                .addField('🕐 **__Schedule__**',
                    `\`\`\`http\nTournament Date:   ${moment.unix(event.ttime).tz(client.config.timezone).format('dddd Do MMMM')}`
                    +`\nRegistration Ends: ${moment.unix(event.rtime).tz(client.config.timezone).format('h:mma z')}`
                    +`\nTournament Starts: ${moment.unix(event.ttime).tz(client.config.timezone).format('h:mma z')}\n\`\`\``)
                .setThumbnail(thumbnail)
            
            const channel = client.channels.cache.find(channels => channels.id === client.config.ANNOUNCEMENTS)
            channel.send(`<@&${client.config.COMMUNITY}>`, Embed)

            await client.sql('UPDATE `tournaments` SET `announced`=1 WHERE `title`="'+event.title+'"')
        }
    }
}
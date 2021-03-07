module.exports = {
    desc: 'lists recent tournaments',
	syntax: '',
	async run(message, args) {
        const Discord = require('discord.js')
        const moment = require('moment-timezone')
        const momentDurationFormatSetup = require("moment-duration-format")

        let query = await message.client.query('SELECT * FROM `tournaments` WHERE `ttime`>'+(moment().unix()-604800)+' AND `ttime`<'+moment().unix())
        const events = query.getAll()
        events.sort(function(a, b) {return a.ttime - b.ttime})

        const User = require('../../utils/User').default
        const user = await User.build(message.client, message.author.id)
        const timezone = user.timezone

        const Embed = new Discord.MessageEmbed()
            .setColor(message.client.config.color)
            .setTitle('Recent Tournaments')
            .setURL('https://orla.pro')
            .setDescription(`These are the tournaments run over the past week, adjusted for **${timezone.split('/')[1]}** time.`)
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

                const content = `Time: **${time}**`
                                +rtime
                                +`\nOpen: **${topen}**`
                                +`\nMode: **${event.mode}**`
                                +`\nPrize: **${event.prize}**`
                                +stream
                                +`\nURL:** ${event.link} **`

                Embed.addField(`${icon} **__${event.title}__**`, content)
            }
        }

        message.channel.send(Embed)
    }
}
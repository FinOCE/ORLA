module.exports = {
    desc: 'checks basic info about a Discord account',
    syntax: '[@user]',
    async run(message, args) {
        const Discord = require('discord.js')
        const moment = require('moment-timezone')
        
        // Create User object
        const {User} = require('../../utils/User')
        const user = await User.build(message.client, (message.mentions.members.first()) ? message.mentions.members.first().user.id : message.author.id)
        const member = (message.mentions.members.first()) ? message.mentions.members.first() : message.member

        // Create Embed object
        const Embed = new Discord.MessageEmbed()
            .setColor(message.client.config.color)
            .setTitle(`Account Info: ${user.discord.username}#${user.discord.discriminator}`)
            .setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
            .setThumbnail(user.discord.avatarURL)
        
        // Add ORLA link for description
        if (user.orla.url !== null) Embed.setDescription(user.orla.url)

        // Add XP widget
        let position = await message.client.query('SELECT * FROM `users` WHERE `xp`>'+user.orla.xp.total)
        position = position.getAll().length+1

        const c_b = message.client.guilds.cache.find(g => g.id === '690588183683006465').emojis.cache.find(e => e.name === 'c_b')
        const c_w = message.client.guilds.cache.find(g => g.id === '690588183683006465').emojis.cache.find(e => e.name === 'c_w')

        let bar = ''
        for (let i = 0; i < Math.round((user.orla.xp.progress.remaining/user.orla.xp.progress.cost)*10); i++) {
            bar += `${c_b}`
        }
        for (let i = 0; i < 10-Math.round((user.orla.xp.progress.remaining/user.orla.xp.progress.cost)*10); i++) {
            bar += `${c_w}`
        }

        Embed.addField('Discord XP', `Level: **${user.orla.xp.level}**\n${bar}\nTotal: **${user.orla.xp.total}** - **${user.orla.xp.progress.remaining}**/**${user.orla.xp.progress.cost}**\nPosition: **#${position}**`, true)

        // Add platform widget
        let platformField = ''
        Object.keys(user.platforms).forEach(platform => {
            if (user.platforms[platform] && platform !== 'main') {
                const logo = message.client.guilds.cache.find(g => g.id === '690588183683006465').emojis.cache.find(e => e.name === `b_${platform}`)
                platformField += `${logo} **${user.platforms[platform]}**\n`
            }
        })
        Embed.addField('Accounts', platformField, true)

        // Add role widget
        const roles = member._roles.map(role => `<@&${role}>`)
        let roleField = ''
        roles.forEach(role => {
            roleField += role + ' '
        })
        Embed.addField('Roles', (roleField.length > 0) ? roleField : '*User has no roles*', false)*

        // Add key date widgets
        Embed.addField('Account Created', moment.unix(Math.round(user.discord.createdAt/1000)).tz(user.timezone).format('Do MMMM YYYY, h:mma z'), true)
        Embed.addField('Joined Server', moment.unix(Math.round(member.joinedTimestamp/1000)).tz(user.timezone).format('Do MMMM YYYY, h:mma z'), true)

        // Send Embed
        message.channel.send(Embed)
    }
}
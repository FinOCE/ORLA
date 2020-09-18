module.exports = {
    desc: 'checks basic info about a Discord account',
    syntax: '[@user]',
    async run(message, args) {
        const Discord = require('discord.js')
        const moment = require('moment-timezone')

        const userSQL = await message.client.sql('SELECT * FROM `users` WHERE `id`="'+message.author.id+'"')
        const timezone = userSQL[0].timezone

        const member = (message.mentions.members.first()) ? message.mentions.members.first() : message.member
        const displayName = (member.nickname === null) ? member.user.username : member.nickname

        let user = await message.client.sql('SELECT * FROM `users` WHERE `id`="'+member.user.id+'"')
        if (!(0 in user)) return
        user = user[0]

        const total = user.xp
        const level = message.client.xp.getLevel(total)[0]
        const rankup = message.client.xp.getLevel(total)[1]
        const remainder = message.client.xp.getLevel(total)[2]
        const position = await message.client.sql('SELECT * FROM `users` WHERE `xp`>'+total)

        const Embed = new Discord.MessageEmbed()
            .setColor(message.client.config.color)
            .setTitle(`Account Info: ${displayName}`)
            .setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
        
        if ((user.url !== null) && (user.url !== undefined)) Embed.setDescription(`https://orla.pro/${user.url}`)

        // Add line from emojis here
        const line = ''

        Embed.addField('Discord XP', `Level: **${level}**\n${line}\nTotal: **${total}** - **${remainder}**/**${rankup}**\nPosition: **#${position.length+1}**`, true)

        // Add platforms here as embed

        const roles = member._roles.map(role => `<@&${role}>`)
        let roleField = ''
        roles.forEach(role => {
            roleField += role + ' '
        })
        Embed.addField('Roles', roleField, false)

        Embed.addField('Account Created', moment.unix(Math.round(member.user.createdAt/1000)).tz(timezone).format('Do MMMM YYYY, h:mma z'), true)
        Embed.addField('Joined Server', moment.unix(Math.round(member.joinedTimestamp/1000)).tz(timezone).format('Do MMMM YYYY, h:mma z'), true)

        message.channel.send(Embed)
    }
}
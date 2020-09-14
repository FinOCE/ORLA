module.exports = {
	desc: 'sends the specified user\'s profile picture',
	syntax: '[@user]',
	run(message, args) {
	    const Discord = require('discord.js')
        
        if (0 in args) {
            if (!args[0].startsWith('<@!') || !args[0].endsWith('>')) {
                message.client.error('invalidSyntax', message)
                return
            }
        }
        const account = (0 in args) ? args[0].split('<@!')[1].split('>')[0] : message.author.id
        
        if (!message.guild.members.cache.get(account)) {
            message.client.error('invalidSyntax', message)
            return
	    }
	    
	    const Embed = new Discord.MessageEmbed()
            .setColor(message.client.config.color)
            .setTitle(`${message.guild.members.cache.get(account).user.username}#${message.guild.members.cache.get(account).user.discriminator}`)
            .setImage(message.guild.members.cache.get(account).user.avatarURL())
            .setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo);
        message.channel.send(Embed)
	},
};
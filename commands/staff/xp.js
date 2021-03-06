module.exports = {
	desc: 'give or take a user\'s XP',
	syntax: '[@user]* [amount]*',
	onlyORLA: true,
	async run(message, args) {
		const Discord = require('discord.js')

		// Only run command if the args are valid
		if (isNaN(args[1])) return
		if (message.mentions.members.first() == undefined) return

		const User = require('../../utils/User')
		user = await User.build(message.client, message.author.id)
		if (args[1] > 0) {
			user.orla.xp.give(args[1])
		} else {
			user.orla.xp.take(-args[1])
		}

		const Embed = new Discord.MessageEmbed()
			.setColor(message.client.config.color)
			.setDescription(`You successfully gave ${message.mentions.members.first().user} ${args[1]} xp.`)
			.setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
		
		message.channel.send(Embed)
    }
}
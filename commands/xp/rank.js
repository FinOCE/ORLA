module.exports = {
	desc: 'checks Discord XP stats',
	syntax: '[@user]',
	onlyORLA: true,
	async run(message, args) {
		const Discord = require('discord.js')

		const user = await message.client.xp.getXP(message)

		if (user) {
			const member = (message.mentions.members.first()) ? message.mentions.members.first() : message.member
			const nickname = (member.nickname) ? member.nickname : member.user.username

			const xp = user[0].xp
			const level = user[1][0]
			const required = user[1][1]
			const remaining = user[1][2]
			const position = user[2]

			const c_blue = message.guild.emojis.cache.find(emoji => emoji.name === 'c_blue')
			const c_white = message.guild.emojis.cache.find(emoji => emoji.name === 'c_white')

			let bar = ''
			for (let i = 0; i < Math.floor((remaining/required)*10); i++) {
				bar += `${c_blue}`
			}
			for (let i = 0; i < 10-Math.floor((remaining/required)*10); i++) {
				bar += `${c_white}`
			}

			const Embed = new Discord.MessageEmbed()
				.setColor(message.client.config.color)
				.setThumbnail(member.user.avatarURL())
				.setTitle(`${nickname} is level ${level}`)
				.setDescription(`${bar}\nTotal: **${xp}** - **${remaining}**/**${required}**\nPosition: **#${position}**`)
				.setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
			
			message.channel.send(Embed)
		}
    }
}
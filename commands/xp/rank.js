module.exports = {
	desc: 'checks Discord XP stats',
	syntax: '[@user]',
	onlyORLA: true,
	async run(message, args) {
		const Discord = require('discord.js')

		const member = (message.mentions.members.first()) ? message.mentions.members.first() : message.member
		const nickname = (member.nickname) ? member.nickname : member.user.username

		const {User} = require('../../utils/User')
		const user = await User.build(message.client, member.user.id)

		const Embed = new Discord.MessageEmbed()
			.setColor(message.client.config.color)
			.setTitle(`${nickname} is level ${user.orla.xp.level}`)
			.setThumbnail(user.discord.avatarURL)
			.setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
		
		const c_blue = message.client.guilds.cache.find(g => g.id === '690588183683006465').emojis.cache.find(e => e.name === 'c_blue')
		const c_white = message.client.guilds.cache.find(g => g.id === '690588183683006465').emojis.cache.find(e => e.name === 'c_white')

		let bar = ''
        for (let i = 0; i < Math.round((user.orla.xp.progress.remaining/user.orla.xp.progress.cost)*10); i++) {
            bar += `${c_blue}`
        }
        for (let i = 0; i < 10-Math.round((user.orla.xp.progress.remaining/user.orla.xp.progress.cost)*10); i++) {
            bar += `${c_white}`
        }

		const position = (await message.client.query('SELECT * FROM `users` WHERE `xp`>'+user.orla.xp.total)).getAll().length+1

		Embed.setDescription(`${bar}\nTotal: **${user.orla.xp.total}** - **${user.orla.xp.progress.remaining}**/**${user.orla.xp.progress.cost}**\nPosition: **#${position}**`)

		message.channel.send(Embed)
	}
}
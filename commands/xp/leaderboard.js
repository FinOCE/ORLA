module.exports = {
	desc: 'shows Discord XP leaderboard',
	syntax: '[page]',
	onlyORLA: true,
	async run(message, args) {
		const Discord = require('discord.js')

		const page = (0 in args && !isNaN(args[0]) && args[0] > 0) ? args[0]-1 : 0

		const loading = message.client.guilds.cache.find(g => g.id === '690588183683006465').emojis.cache.find(e => e.name === 'd_loading')
		message.channel.send(`${loading} Getting leaderboard...`).then(async msg => {
			const users = (await message.client.query('SELECT * FROM `users`')).getAll()
			users.sort((a, b) => {return b.xp - a.xp})

			const Embed = new Discord.MessageEmbed()
				.setColor(message.client.config.color)
				.setTitle(`XP Leaderboard`)
				.setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
			
			let list = ''

			let range = (users.length - page * 10 < 10) ? users.length - page * 10 : 10
			for (let i = 0; i < range; i++) {
				const {User} = require('../../utils/User')
				const user = await User.build(message.client, users[page*10+i].id)
				list += `**#${page * 10 + i + 1}** <@${user.id}> - Level **${user.orla.xp.level}** (**${user.orla.xp.total}**)\n`
			}

			Embed.setDescription(`Page **${page + 1}** of **${Math.ceil(users.length/10)}**\n\n${list}`)

			msg.edit(' ', Embed)
		})
    }
}
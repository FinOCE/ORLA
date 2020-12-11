module.exports = {
	desc: 'shows Discord XP leaderboard',
	syntax: '[page]',
	onlyORLA: true,
	async run(message, args) {
		const Discord = require('discord.js')

		const page = (0 in args && !isNaN(args[0]) && args[0] > 0) ? args[0]-1 : 0

		const users = (await message.client.query('SELECT * FROM `users`')).getAll()
		users.sort((a, b) => {return b.xp - a.xp})

		const Embed = new Discord.MessageEmbed()
			.setColor(message.client.config.color)
			.setTitle(`XP Leaderboard`)
			.setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
		
		let list = ''

		let range = (users.length - page * 10 < 10) ? users.length - page * 10 : 10
		for (let x = 0; x < range; x++) {
			list += `**#${page * 10 + x + 1}** <@${users[page*10+x].id}> - Level **${message.client.xp.getLevel(users[page*10+x].xp)[0]}** (**${users[page*10+x].xp}**)\n`
		}

		Embed.setDescription(`Page **${page + 1}** of **${Math.ceil(users.length/10)}**\n\n${list}`)

		if (list !== '') message.channel.send(Embed)
    }
}
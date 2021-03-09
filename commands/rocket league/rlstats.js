module.exports = {
	desc: 'checks rocket league account stats',
	syntax: '[platform] [account]',
	onlyORLA: true,
	async run(message, args) {
		const Discord = require('discord.js')
		const moment = require('moment-timezone')

		const requestInitiated = moment().unix()

		// Determine the type of user the requested rank is from
		const userType = (!(0 in args)) ?
			'self'
			:(!(1 in args) && message.mentions.members.first()) ?
				'mention'
				:(1 in args) ?
					'other'
					:null
		
		// Set the player's info based on type determined above
		const playerInfo = {platform: null, id: null, self: false}
		switch (userType) {
			case 'self': {
				// If user is checking their own rank
				const user = (await message.client.query('SELECT * FROM `users` WHERE `id`="'+message.author.id+'"')).getFirst()
				if (user.main === null) return message.client.error('notLinked', message).send()

				playerInfo.platform = user.main
				playerInfo.id = user[user.main]
				playerInfo.self = true
				break
			}
			case 'mention': {
				// If user is checking someone's rank by @mentioning them
				const user = (await message.client.query('SELECT * FROM `users` WHERE `id`="'+message.mentions.members.first().user.id+'"')).getFirst()
				if (user.main === null) return message.client.error('notLinkedOther', message).send()
				
				playerInfo.platform = user.main
				playerInfo.id = user[user.main]
				break
			}
			case 'other': {
				// If user is checking someones rank from their platform and ID
				if (['epic', 'steam', 'xbox', 'ps', 'switch'].indexOf(args[0].toLowerCase()) === -1) return message.client.error('invalidPlatform', message).send()

				playerInfo.platform = args[0].toLowerCase()
				playerInfo.id = args[1]
				break
			}
			default: return message.client.error('noPlayerSpecified', message).send()
		}

		// Send initial message to edit with response once received
		const loading = message.client.guilds.cache.find(g => g.id === '690588183683006465').emojis.cache.find(e => e.name === 'd_loading')
		message.channel.send(`${loading} Getting stats...`).then(async msg => {
			const {Stat} = require('../../utils/Stat')
			const player = await Stat.build(playerInfo)

			// Send error if player not found or request is timed out
			if (!player.valid) return msg.edit(' ', (requestInitiated+20 > moment().unix()) ?
				message.client.error('profileNotFound', message).createEmbed()
				:message.client.error('requestTimeout', message).createEmbed()
			)

			// Create Embed to fill with player data
			const Embed = new Discord.MessageEmbed()
				.setColor(message.client.config.color)
				.setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
				.setTitle(`RL Stats: ${player.user.name}`)
				.setURL(player.user.statsURL)
				.setThumbnail(player.user.avatarURL)
			
			Object.values(player.stats).forEach(stat => {
				const position = (!stat.overall) ? '' : ((stat.overall >= 1000) ? `*(Top ${Math.floor((100 - stat.percentile)*10)/10}%)*` : `*(#${stat.overall})*`)
				const value = Number(Math.floor(stat.value*10)/10).toLocaleString('en')
				const percentage = (stat.name === 'Goal Ratio') ? '%' : ''
				const overall = (!stat.overall) ? '' : ('Global: #' + Number(stat.overall).toLocaleString('en'))

				Embed.addField(`__${stat.name}__ ${position}`, `${value}${percentage}\n${overall}`, true)
			})

			Embed.addField("‎", "‎", true) // these have invisible characters in them
			Embed.addField("‎", "‎", true) // these have invisible characters in them

			// Edit message to include player data
			msg.edit(' ', Embed)
		})
	}
}
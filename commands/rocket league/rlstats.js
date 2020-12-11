module.exports = {
	desc: 'checks rocket league account stats',
	syntax: '[platform] [account]',
	onlyORLA: true,
	async run(message, args) {
		const Discord = require('discord.js')
		const moment = require('moment-timezone')

		const requestInitiated = moment().unix()

		const accountInfo = {
			"isReal": false
		}

		if (!(0 in args)) {
			// if checking own rank
			const userSQL = await message.client.sql('SELECT * FROM `users` WHERE `id`="'+message.author.id+'"')
			const user = userSQL[0]

			if (user.main !== null) {
				// if account is linked
				accountInfo['platform'] = user.main
				accountInfo['account'] = user[user.main]
				accountInfo['isReal'] = true
			} else {
				// if account is not linked
				message.client.error('notLinked', message)
				return
			}
		} else {
			// if checking other player's rank
			if (message.mentions.members.first()) {
				// if checking via ping
				const userSQL = await message.client.sql('SELECT * FROM `users` WHERE `id`="'+message.mentions.members.first().user.id+'"')
				const user = userSQL[0]

				if (user.main !== null) {
					// if account is linked
					accountInfo['platform'] = user.main
					accountInfo['account'] = user[user.main]
				} else {
					// if account is not linked
					message.client.error('notLinkedOther', message)
					return
				}
			} else {
				// if checking via platform and account
				if (['pc', 'ps', 'xbox'].indexOf(args[0].toLowerCase()) === -1) {
                    message.client.error('invalidPlatform', message)
                    return
                }
                
                if (!(1 in args)) {
                    message.client.error('noPlayerSpecified', message)
                    return
				}
				
				accountInfo['platform'] = args[0].toLowerCase()
				accountInfo['account'] = args[1]
			}
		}
		const platforms = {steam: 'steam', pc: 'steam', xbox: 'xbl', ps: 'psn'}
		accountInfo['platform'] = platforms[accountInfo['platform']]
		
		const loading = message.guild.emojis.cache.find(emoji => emoji.name === 'd_loading')

		message.channel.send(`${loading} Getting stats...`).then(async msg => {
			// Don't bother looking for stats.js, its in the .gitignore
			const {Stat} = require('../../utils/Stat')
			const player = await Stat.build(message.client, accountInfo['platform'], accountInfo['account'])

			if (player.valid) {
				const Embed = new Discord.MessageEmbed()
					.setColor(message.client.config.color)
					.setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
					.setTitle(`RL Stats: ${player.user.name}`)
					.setURL(player.user.statsURL)
					.setThumbnail(player.user.avatarURL)

				for (let i = 0; i < Object.keys(player.stats).length-1; i++) {
					let stat = player.stats[Object.keys(player.stats)[i]]
					
					const percentile = `(Top ${Math.floor((100 - stat.percentile)*10)/10}%)`
					const value = Number(Math.floor(stat.value*10)/10).toLocaleString('en')
					const percentage = (stat.name === 'Goal Ratio') ? '%' : ''
					const overall = Number(stat.overall).toLocaleString('en')

					Embed.addField(`__${stat.name}__ *${percentile}*`, `${value}${percentage}\nGlobal: #${overall}`, true)
				}

				Embed.addField('First Season', player.stats.firstSeason, true)
				Embed.addField("‎", "‎", true) // these have invisible characters in them

				msg.edit(' ', Embed)
			} else {
				if (requestInitiated > (moment().unix() - 20)) {
					const Embed = new Discord.MessageEmbed()
						.setColor(message.client.config.color)
						.setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
						.setTitle('Error: Profile Not Found')
						.setDescription('The profile you searched for could not be found. Please try again.')
					
					msg.edit(' ', Embed)
				} else {
					const Embed = new Discord.MessageEmbed()
						.setColor(message.client.config.color)
						.setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
						.setTitle('Error: Request Timeout')
						.setDescription('The server took too long to respond. Unfortunately we can\'t receive your account stats right now.')
					
					msg.edit(' ', Embed)
				}
			}
		})
	}
}
module.exports = {
	desc: 'links Discord account with RL account',
	syntax: '[platform]* [account]*',
	onlyORLA: true,
	async run(message, args) {
		const Discord = require('discord.js')

		if (!(0 in args)) {
			message.client.error('invalidSyntax', message)
			return
		}

		if (['pc', 'ps', 'xbox'].indexOf(args[0].toLowerCase()) === -1) {
			message.client.error('invalidPlatform', message)
			return
		}

		if (!(1 in args)) {
			message.client.error('noPlayerSpecified', message)
			return
		}

		await message.client.query('UPDATE `users` SET `platform`="'+args[0].toLowerCase()+'",`account`="'+args[1]+'"')

		const response = 'Your account has been linked to your profile. The account details you set are as follows:\n\n'
						+`Platform: \`${args[0].toLowerCase()}\`\n`
						+`Account: \`${args[1]}\`\n\n`
						+`You can now type \`${message.client.config.prefix}rlrank\` to check your rank, if the details provided point to a valid account.`

		const Embed = new Discord.MessageEmbed()
			.setColor(message.client.config.color)
			.setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
			.setTitle('Account Successfully Linked')
			.setDescription(response)
		
		message.channel.send(Embed)
    }
}
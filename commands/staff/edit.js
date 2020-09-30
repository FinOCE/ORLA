module.exports = {
	desc: 'edits messages sent by the bot',
	syntax: '[#channel]* [#message]* [image URL] [title] | [message]',
	async run(message, args) {
        const Discord = require('discord.js')
        
        // Ignore if no args are sent
        if (!args[2]) return

		// Get channel and message
		const channel = message.client.channels.fetch(args[0]).then(channel => {
			channel.messages.fetch(args[1]).then(msg => {
				args.shift()
				args.shift()

				// Create Embed
				const Embed = new Discord.MessageEmbed()
					.setColor(message.client.config.color)

				// Add image if provided
				if (args[0].startsWith('http')) {
					Embed.setImage(args[0])
					args.shift()
				}
		
				// Split title and message
				let response = args.join(' ')
				if (response.includes('|')) {
					let content = response.split('|')
					Embed.setTitle(content[0])
					content.shift()
					response = content.join('|')
				}
				Embed.setDescription(response)

				msg.edit(Embed)
			}).catch(console.error)
		}).catch(console.error)
    }
}
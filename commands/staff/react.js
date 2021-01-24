module.exports = {
	desc: 'reacts to message with the reaction',
	syntax: '[#channel]* [message]* [reaction]*',
	run(message, args) {
        const Discord = require('discord.js')
        
        const channelID = args[0]
        const messageID = args[1]
        const reactionID = args[2]

        const channel = message.client.channels.cache.find(channel => channel.id === channelID)
        const msg = channel.messages.fetch(messageID).then(msg => msg.react(reactionID))
	}
}
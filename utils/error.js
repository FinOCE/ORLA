const { DiscordAPIError } = require("discord.js")

module.exports = (method, message) => {
    const Discord = require('discord.js')
    
    // List all error methods and their responses
    const methods = {
        "invalidPermission" : {
            "title": "Invalid Permission",
            "description": "Sorry, but you don't have permission to use that command."
        },
        "invalidSyntax": {
            "title": "Invalid Syntax",
            "description": `To check the correct syntax, please type \`${message.client.config.prefix}help [command]\``
        }
    }

    // Build MessageEmbed
    const Embed = new Discord.MessageEmbed()
        .setColor(message.client.config.color)
        .setFooter('ORLA', message.client.config.logo)
        .setTitle('Error: ' + methods[method].title)
        .setDescription(methods[method].description)

    // Send error message
    message.channel.send(Embed)
}
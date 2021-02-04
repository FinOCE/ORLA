module.exports = {
	desc: 'used to setup the bot',
	syntax: '',
	run(message, args) {
        const Discord = require('discord.js')
        
        const embed = new Discord.MessageEmbed()
            .setTitle('How to Setup ORLA')
            .setDescription('To setup the ORLA bot on your server, head to [your dashboard](https://orla.pro/dashboard) and log in to access the various toggles. The whole process is explained clearly on the dashbard.')
            .setColor(message.client.config.color)
            .setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
        message.channel.send(embed)
    }
}
module.exports = {
	desc: 'lists all available commands',
	syntax: '[command]',
	run(message, args) {
        const Discord = require('discord.js')

        const Embed = new Discord.MessageEmbed()
            .setColor(message.client.config.color)
            .setFooter(`ORLA - Requested by ${message.author.tag}`, message.client.config.logo)
        
        if (!args[0]) {
            const commandParser = command => `**${message.client.config.prefix}${command.name}:** ${command.desc}`

            let categories = []
            message.client.commands.forEach(command => {
                if (categories.indexOf(command.category) === -1) {
                    categories.push(command.category)
                }
            })

            // Put staff commands at the bottom of the response
            categories = categories.filter(category => category !== 'staff')
            categories.push('staff')

            let content = ''
            categories.forEach(category => {
                content += `\n**__${category.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))}__**\n${message.client.commands.filter(command => command.category === category).map(commandParser).join('\n')}\n`
            })

            Embed.setTitle('Help')
            Embed.setDescription(content)
        } else {
            const command = message.client.commands.get(args[0])
            if (!command) return

            const syntax = (command.syntax === '') ? '' : ` ${command.syntax}`
            const required = (command.syntax.includes('*')) ? '\n*Arguments with an asterisk are required.*' : ''
            
            Embed.setTitle(`Help: ${command.name.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))}`)
            Embed.setDescription(`**${args[0]}** ${command.desc}\n\nSyntax: \`${message.client.config.prefix}${args[0].toLowerCase()}${syntax}\`${required}`)
        }

        message.channel.send(Embed)
	}
}
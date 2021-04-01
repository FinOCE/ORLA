import Command, {CommandOptions} from '../../utils/Command'
import {Message, MessageEmbed} from 'discord.js';
import Client from '../../utils/Client'

export default class HelpCommand extends Command {
    constructor(client: Client, options: CommandOptions) {
        super(client, options)
    }

    run(message: Message, args: Array<string>) {
        let Embed = new MessageEmbed()
            .setColor(this.client.config.color)
            .setFooter(`ORLA - Requested by ${message.author.tag}`, this.client.config.logo)
        
        if (!(0 in args)) {
            // Display categories
            Embed.setTitle('Available Commands')

            // List categories
            Object.entries(this.client.commands).forEach(([category, commands]) => {
                const categoryDetails = require(`../${category}/details.json`)
                Embed.addField(
                    category.replace(/(^\w|\s\w)/g, w => w.toUpperCase()),
                    `> ${categoryDetails.description}\n\nTo view commands, type \`.help ${category.replace(/ +/g, '')}\``,
                    true
                )
            })

            // Add fields to evenly display ranks
			let blankFields = 0
			while ((Object.keys(this.client.commands).length + blankFields) % 3 !== 0) {
				Embed.addField("‎", "‎", true) // Contains invisible characters to make blank fields
				blankFields++
			}
        } else {
            // Details for specific category or command
            if (Object.keys(this.client.commands).map(c => {return c.replace(/ +/g, '')}).indexOf(args[0].toLowerCase()) !== -1) {
                // Category
                const category = Object.keys(this.client.commands).find(c => c.replace(/ +/g, '') === args[0].toLowerCase())!
                Embed.setTitle(`Available Commands - ${category.replace(/(^\w|\s\w)/g, w => w.toUpperCase())}`)
                Embed.setDescription(
                    this.client.commands[category].map(c => `**${this.client.config.prefix}${c.name}**: ${c.description}`)
                )
            } else {
                // Command
                if (Object.values(this.client.commands).some(c => c.has(args[0]))) {
                    // Command exists
                    const command = Object.values(this.client.commands).find(c => c.has(args[0]))!.get(args[0])!

                    const syntax = (command.syntax === '') ? '' : `Syntax: \`${this.client.servers[message.guild!.id].prefix}${command.name} ${command.syntax}\``
                    const required = (command.syntax.includes('*')) ? '\n*Arguments with an asterisk are required.*' : ''

                    Embed.setTitle(`Help - ${command.name}`)
                    Embed.setDescription(
                        `**${command.name}** ${command.description}.\n\n${syntax}${required}`
                    )
                } else {
                    // Command doesn't exist
                    Embed = this.client.error('commandNotFound', message).createEmbed()
                }
            }
        }

        message.channel.send(Embed)
    }
}
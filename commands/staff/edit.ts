import Command, {CommandOptions} from '../../utils/Command'
import {Message, TextChannel, MessageEmbed} from 'discord.js';
import Client from '../../utils/Client'

export default class ExitCommand extends Command {
    constructor(client: Client, options: CommandOptions) {
        super(client, options)
    }

    async run(message: Message, args: Array<string>) {
        if (!args[2]) return this.client.error('invalidSyntax', message).send()

		// Get channel and message
		const channel = await message.client.channels.fetch(args[0])
        if (!channel) return this.client.error('invalidSyntax', message).send()

		const msg = await (channel as TextChannel).messages.fetch(args[1])
        if (!msg) return this.client.error('invalidSyntax', message).send()

        args.shift()
        args.shift()

        // Create Embed
        const Embed = new MessageEmbed()
            .setColor(this.client.config.color)

        // Add image if provided
        if (args[0].startsWith('http')) {
            Embed.setImage(args[0])
            args.shift()
        }
		
        // Split title and message
        const content = args.join(' ')
        if (content.includes('|')) {
            const title = content.split('|')[0]
            const description = content.split('|').slice(1, content.length-1)
            Embed.setTitle(title)
            Embed.setDescription(description)
        } else {
            Embed.setDescription(content)
        }

		msg.edit(Embed)
    }
}
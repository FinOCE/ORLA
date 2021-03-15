import Command, {CommandOptions} from '../../utils/Command'
import {Message, MessageEmbed} from 'discord.js';
import Client from '../../utils/Client'
import User from '../../utils/User'

export default class XPCommand extends Command {
    constructor(client: Client, options: CommandOptions) {
        super(client, options)
    }

    async run(message: Message, args: Array<string>) {
        // Only run command if the args are valid
		if (isNaN(Number(args[1]))) return
		if (message.mentions.members!.first() == undefined) return

        const user = await User.build(this.client, message.mentions.members!.first()?.user.id!)
        user.orla.xp.give(Number(args[1]))

        const Embed = new MessageEmbed()
			.setColor(this.client.config.color)
			.setDescription(`You successfully gave ${message.mentions.members!.first()!.user} ${args[1]} xp.`)
			.setFooter(`ORLA - Requested by ${message.author.tag}`, this.client.config.logo)
		
		message.channel.send(Embed)
    }
}
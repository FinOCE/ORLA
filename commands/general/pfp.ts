import Command, {CommandOptions} from '../../utils/Command'
import {Message, MessageEmbed, GuildMember} from 'discord.js';
import Client from '../../utils/Client'

export default class PfpCommand extends Command {
    constructor(client: Client, options: CommandOptions) {
        super(client, options)
    }

    run(message: Message, args: Array<string>) {
        const member: GuildMember = message.mentions.members?.first() ?? message.member!
        const Embed: MessageEmbed = new MessageEmbed()
            .setTitle(`${member.user.tag}`)
            .setImage(member.user.avatarURL() || '')
            .setColor(this.client.config.color)
            .setFooter(`ORLA - Requested by ${message.author.tag}`, this.client.config.logo)
        message.channel.send(Embed)
    }
}
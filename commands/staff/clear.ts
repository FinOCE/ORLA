import Command, {CommandOptions} from '../../utils/Command'
import {Message, MessageEmbed, GuildMember, TextChannel} from 'discord.js';
import Client from '../../utils/Client'

export default class ClearCommand extends Command {
    constructor(client: Client, options: CommandOptions) {
        super(client, options)
    }

    run(message: Message, args: Array<string>) {
        // Check if the amount specified is valid
        const n = parseInt(args[0])
        if (isNaN(n) || n < 1 || n > 100) return this.client.error('invalidSyntax', message).send()

        {(message.channel! as TextChannel).bulkDelete(n, true).catch(() => this.client.error('somethingWentWrong', message).send())}
    }
}
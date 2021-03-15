import Command, {CommandOptions} from '../../utils/Command'
import {Message} from 'discord.js';
import Client from '../../utils/Client'

export default class ExitCommand extends Command {
    constructor(client: Client, options: CommandOptions) {
        super(client, options)
    }

    run(message: Message, args: Array<string>) {
        process.exit()
    }
}
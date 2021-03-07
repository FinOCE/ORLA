import Command, {CommandOptions} from '../../utils/Command'
import {Message, Snowflake, TextChannel} from 'discord.js';
import Client from '../../utils/Client'

export default class PfpCommand extends Command {
    constructor(client: Client, options: CommandOptions) {
        super(client, options)
    }

    run(message: Message, args: Array<string>) {
        const channelID: Snowflake = args[0]
        const messageID: Snowflake = args[1]
        const reactionID: Snowflake = args[2]

        const channel = message.client.channels.cache.find(channel => channel.id === channelID)
        if (channel) {
            (channel as TextChannel).messages.fetch(messageID)
                .then((msg: Message) => msg.react(reactionID))
                .catch(() => this.client.error('somethingWentWrong', message).send())
        }
    }
}
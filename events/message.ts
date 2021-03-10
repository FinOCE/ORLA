import {Message as MessageJS} from 'discord.js'
import Event from '../utils/Event'
import Client from '../utils/Client'
import User from '../utils/User'

export default abstract class Message extends Event {
    constructor(client: Client) {
        super(client)
    }

    async run(message: MessageJS) {
        const isMainServer = (message.guild!.id === this.client.config.mainServer)

        // Ignore invalid messages
        if (message.author.bot) return
        if (message.channel.type === 'dm') return
        if (isMainServer && message.channel.name.includes('dev-') && process.env.dev !== 'true') return

        // Give xp where applicable
        if ((this.client.xpFromMessage.indexOf(message.author.id) === -1) && isMainServer) {
            const user = await User.build(this.client, message.author.id)
            user.orla.xp.giveFromMessage()
            user.orla.xp.update(message)

            this.client.xpFromMessage.push(message.author.id)
            setTimeout(() => {
                this.client.xpFromMessage.splice(this.client.xpFromMessage.indexOf(message.author.id), 1)
            }, 60000)
        }

        // Handle commands
        const prefix = this.client.servers[message.guild!.id].prefix ?? this.client.config.prefix
        if (!message.content.startsWith(prefix)) return

        const args = message.content.slice(prefix.length).split(/ +/)
        const command = args.shift()!.toLowerCase()

        const cmd = this.client.commands.get(command)!
        if (!cmd) return

        message.delete().then(() => {
            if ((cmd.category === 'staff') && !message.member!.hasPermission('MANAGE_MESSAGES')) {
                return this.client.error('invalidPermission', message).send()
            }
            if ((cmd.onlyORLA !== undefined) && isMainServer) {
                return this.client.error('notMainServer', message).send()
            }
            cmd.run(message, args)
        })
    }
}
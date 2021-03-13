import {MessageReaction, User} from 'discord.js'
import Client from '../utils/Client'
import Event from '../utils/Event'

export default abstract class voiceStateUpdate extends Event {
    constructor(client: Client) {
        super(client)
    }

    async run(reaction: MessageReaction, user: User) {
        if (user.bot || reaction.message.guild!.id !== this.client.config.mainServer) return
        if (reaction.message.partial) await reaction.message.fetch()

        const server = this.client.servers[reaction.message.guild!.id]
        const stateRoles = server.stateroles

        if (reaction.message.channel.id !== server.manualrole.channelID) return
        if (reaction.message.id === server.manualrole.stateMessageID) {
            // State role reaction
            // Remove chosen role
            reaction.message.guild!.member(user.id)!.roles.remove(server.stateroles[reaction.emoji.name.replace('a_', '')])
            // Update SQL database
            await this.client.query('UPDATE `users` SET `location`=null WHERE `id`="'+user.id+'"')
        } else if (reaction.message.id === server.manualrole.muteMessageID) {
            // Mute role reaction
            reaction.message.guild!.member(user.id)!.roles.remove('745583174180012083')
            reaction.message.guild!.member(user.id)!.roles.add('690593520343449621')
        }
    }
}
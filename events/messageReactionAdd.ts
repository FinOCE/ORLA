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
            // Remove other reactions
            reaction.message.reactions.cache
                .filter(r => r.emoji.id !== reaction.emoji.id)
                .forEach(r => r.users.remove(user.id))
            // Remove other roles and add chosen role
            reaction.message.guild!.member(user.id)!.roles.remove(Object.values(stateRoles)).then(() => {
                reaction.message.guild!.member(user.id)!.roles.add(server.stateroles[reaction.emoji.name.replace('a_', '')])
            })
            // Update SQL database
            await this.client.query('UPDATE `users` SET `location`="'+reaction.emoji.name.replace('a_', '')+'" WHERE `id`="'+user.id+'"')
        } else if (reaction.message.id === server.manualrole.muteMessageID) {
            // Mute role reaction
            reaction.message.guild!.member(user.id)!.roles.remove('690593520343449621')
            reaction.message.guild!.member(user.id)!.roles.add('745583174180012083')
        }
    }
}
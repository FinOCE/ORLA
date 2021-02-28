module.exports = async (client, reaction, user) => {
    if (user.bot || reaction.message.guild.id !== client.config.mainServer) return
    if (reaction.message.partial) await reaction.message.fetch()

    const server = client.servers[reaction.message.guild.id]
    const stateRoles = server.stateroles

    if (reaction.message.channel.id !== server.manualrole.channelID) return
    if (reaction.message.id === server.manualrole.stateMessageID) {
        // State role reaction
        // Remove other reactions
        reaction.message.reactions.cache
            .filter(r => r._emoji.id !== reaction._emoji.id)
            .forEach(r => r.users.remove(user.id))
        // Remove other roles and add chosen role
        reaction.message.guild.member(user.id).roles.remove(Object.values(stateRoles)).then(() => {
            reaction.message.guild.member(user.id).roles.add(server.stateroles[reaction._emoji.name.replace('a_', '')])
        })
        // Update SQL database
        await client.query('UPDATE `users` SET `location`="'+reaction._emoji.name.replace('a_', '')+'" WHERE `id`="'+user.id+'"')
    } else if (reaction.message.id === server.manualrole.muteMessageID) {
        // Mute role reaction
        reaction.message.guild.member(user.id).roles.remove('690593520343449621')
        reaction.message.guild.member(user.id).roles.add('745583174180012083')
    }
}
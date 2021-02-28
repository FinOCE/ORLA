module.exports = async (client, reaction, user) => {
    if (user.bot || reaction.message.guild.id !== client.config.mainServer) return
    if (reaction.message.partial) await reaction.message.fetch()

    const server = client.servers[reaction.message.guild.id]
    const stateRoles = server.stateroles

    if (reaction.message.channel.id !== server.manualrole.channelID) return
    if (reaction.message.id === server.manualrole.stateMessageID) {
        // State role reaction
        // Remove chosen role
        reaction.message.guild.member(user.id).roles.remove(server.stateroles[reaction._emoji.name.replace('a_', '')])
        // Update SQL database
        await client.query('UPDATE `users` SET `location`=null WHERE `id`="'+user.id+'"')
    } else if (reaction.message.id === server.manualrole.muteMessageID) {
        // Mute role reaction
        reaction.message.guild.member(user.id).roles.remove('745583174180012083')
        reaction.message.guild.member(user.id).roles.add('690593520343449621')
    }
}
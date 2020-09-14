module.exports = (member) => {
    member.roles.add(client.config.COMMUNITY)
    member.roles.add(client.config.ALPHA)
    
    const channel = client.channels.cache.find(channels => channels.id === client.config.JOINLEAVE)
    channel.send(`<@!${member.user.id}> has **joined** the server`)
}
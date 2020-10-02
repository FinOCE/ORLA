module.exports = (client, member) => {
    //member.roles.add(client.config.COMMUNITY)
    //member.roles.add(client.config.ALPHA)
    for (const i in client.servers[member.guild].autorole) {
        member.roles.add(client.servers[member.guild].autorole[i])
    }
    
    const channel = client.channels.cache.find(channels => channels.id === client.servers[member.guild].joinleave)
    channel.send(`<@!${member.user.id}> has **joined** the server`)
}
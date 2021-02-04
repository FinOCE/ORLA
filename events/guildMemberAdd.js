module.exports = (client, member) => {
    for (const i in client.servers.find(s => s.id === member.guild.id).autorole) {
        member.roles.add(client.servers.find(s => s.id === member.guild.id).autorole[i])
    }
    
    const channel = client.channels.cache.find(channels => channels.id === client.servers.find(s => s.id === member.guild.id).joinleave)
    channel.send(`<@!${member.user.id}> has **joined** the server`)
}
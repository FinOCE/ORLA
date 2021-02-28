module.exports = (client, member) => {
    for (const i in client.servers[member.guild.id].autorole) {
        member.roles.add(client.servers[member.guild.id].autorole[i])
    }
    
    const channel = client.channels.cache.find(channels => channels.id === client.servers[member.guild.id].joinleave.text)
    channel.send(`<@!${member.user.id}> has **joined** the server`)

    client.channels.cache.find(c => c.id === client.servers[member.guild.id].joinleave.counter).setName(`Members: ${member.guild.memberCount-1}`)
}
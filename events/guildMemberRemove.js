module.exports = (client, member) => {
    const channel = client.channels.cache.find(channels => channels.id === client.servers[member.guild.id].joinleave.text)
    channel.send(`<@!${member.user.id}> has **left** the server`)

    client.channels.cache.find(c => c.id === client.servers[member.guild.id].joinleave.counter).setName(`Members: ${member.guild.memberCount-1}`)
}
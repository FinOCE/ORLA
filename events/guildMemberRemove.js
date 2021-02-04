module.exports = (client, member) => {
    const channel = client.channels.cache.find(channels => channels.id === client.servers.find(s => s.id === member.guild.id).joinleave)
    channel.send(`<@!${member.user.id}> has **left** the server`)
}
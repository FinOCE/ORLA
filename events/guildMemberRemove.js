module.exports = (member) => {
    const channel = client.channels.cache.find(channels => channels.id === client.servers[member.guild].joinleave)
    channel.send(`<@!${member.user.id}> has **left** the server`)
}
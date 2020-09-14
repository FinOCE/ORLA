module.exports = (member) => {
    const channel = client.channels.cache.find(channels => channels.id === client.config.JOINLEAVE)
    channel.send(`<@!${member.user.id}> has **left** the server`)
}
module.exports = (client, from, to) => {
    if (to.channelID !== null && to.channelID !== client.servers[to.guild.id].afk) {
        const {User} = require('../utils/User')
        const user = await User.build(client, to.id)
        client.xpFromVoice[to.id] = client.setInterval(() => {
            user.orla.xp.giveFromVoice()
        }, 60000)
    } else {
        clearInterval(client.xpFromVoice[to.id])
    }
}
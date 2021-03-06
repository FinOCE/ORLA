module.exports = async (client, from, to) => {
    if (to.channelID !== null && to.channelID !== client.servers[to.guild.id].afk) {
        //console.log(to.guild.member(to.id))
        const User = require('../utils/User')
        const user = await User.build(client, to.id)
        client.xpFromVoice[to.id] = client.setInterval(() => {
            user.orla.xp.giveFromVoice()
        }, 60000)
    } else {
        clearInterval(client.xpFromVoice[to.id])
    }
}
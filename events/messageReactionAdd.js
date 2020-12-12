module.exports = async (client, reaction, user) => {
    if (user.bot) return
    
    let manualrole = await client.query('SELECT `manualrole` FROM `servers` WHERE `id`="'+reaction.message.guild.id+'"')
    if (manualrole !== null) {
        manualrole = JSON.parse(manualrole)
        if (reaction.message.channel.id === manualrole.channelID) {
            const {Role} = require('../utils/Role')
            new Role(client, reaction, user).add(manualrole)
        }
    }
}
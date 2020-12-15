module.exports = async (client, reaction, user) => {
    if (user.bot) return
    
    let manualrole = await client.query('SELECT `manualrole` FROM `servers` WHERE `id`="'+reaction.message.guild.id+'"')
    manualrole = JSON.parse(manualrole.getFirst())
    if (manualrole !== null) {
        if (reaction.message.channel.id === manualrole.channelID) {
            if (reaction.message.guild.id === '690588183683006465') {
                // Only works for ORLA server
                if (['a_wa', 'a_vic', 'a_tas', 'a_sa', 'a_qld', 'a_nz', 'a_nt', 'a_nsw', 'a_act'].indexOf(reaction._emoji.name) !== -1) {
                    const role = reaction._emoji.name.replace('a_', '')
                    const roles = await client.query('SELECT `stateroles` FROM `servers` WHERE `id`="'+reaction.message.guild.id+'"')

                    reaction.message.guild.member(user.id).roles.remove(JSON.parse(roles.getAll())[role])
                    await client.query('UPDATE `users` SET `location`=null WHERE `id`="'+user.id+'"')
                }
                if (reaction._emoji.name === 'd_check') {
                    reaction.message.guild.member(user.id).roles.remove('745583174180012083')
                    reaction.message.guild.member(user.id).roles.add('690593520343449621')
                }
            }
        }
    }
}
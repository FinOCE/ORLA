module.exports = {
    async addStateRole(client, reaction, user) {
        const server = await client.sql('SELECT * FROM `servers` WHERE `id`="'+reaction.message.guild.id+'"')
        const getrole = server[0].getrole
        const states = JSON.parse(server[0].states)
        
        if (reaction.message.id === getrole) {
            states.forEach(state => {
                if (reaction._emoji.id == state.emoji) {
                    reaction.message.reactions.cache.forEach(emote => {
                        if (emote._emoji.id !== reaction._emoji.id) emote.remove(user.id)
                    })
                    states.forEach(state => {
                        if (reaction.message.guild.member(user.id).roles.cache.some(role => role.id === state.role)) {
                            reaction.message.guild.member(user.id).roles.remove(state.role)
                        }
                    })
                    reaction.message.guild.member(user.id).roles.add(state.role)
                }
            })
        }
    },
    async removeStateRole(client, reaction, user) {
        const server = await client.sql('SELECT * FROM `servers` WHERE `id`="'+reaction.message.guild.id+'"')
        const getrole = server[0].getrole
        const states = JSON.parse(server[0].states)

        if (reaction.message.id === getrole) {
            states.forEach(state => {
                if (reaction._emoji.id == state.emoji) {
                    reaction.message.guild.member(user.id).roles.remove(state.role)
                }
            })
        }
    }
}
module.exports = {
    async addStateRole(client, reaction, user) {
        let getRoleID = await client.sql('SELECT * FROM `servers` WHERE `id`="'+reaction.message.guild.id+'"')
        getRoleID = getRoleID[0].getrole

        if (reaction.message.id === getRoleID) {
            const states = await client.sql('SELECT * FROM `states`')
            console.log(states)
            states.forEach(state => {
                if (reaction._emoji.id == state.emoji) {
                    reaction.message.guild.member(user.id).roles.add(state.role)
                }
            })
        }
    },
    async removeStateRole(client, reaction, user) {
        let getRoleID = await client.sql('SELECT * FROM `servers` WHERE `id`="'+reaction.message.guild.id+'"')
        getRoleID = getRoleID[0].getrole

        if (reaction.message.id === getRoleID) {
            const states = await client.sql('SELECT * FROM `states`')
            console.log(states)
            states.forEach(state => {
                if (reaction._emoji.id == state.emoji) {
                    reaction.message.guild.member(user.id).roles.remove(state.role)
                }
            })
        }
    }
}
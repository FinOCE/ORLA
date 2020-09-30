module.exports = {
    async giveXP(message, xp) {
        const users = await message.client.sql('SELECT * FROM `users` WHERE `id`="'+message.mentions.members.first().user.id+'"')
        if (0 in users) {
            await message.client.sql('UPDATE `users` SET `xp`=`xp`+'+xp+' WHERE `id`="'+message.mentions.members.first().user.id+'"')

            const newXP = Number(users[0].xp) + Number(xp)
            return newXP
        }
    },
    async getXP(message) {},
    async addXP(message) {
        const xp = Math.floor(Math.random()*11 + 15)
        const users = await message.client.sql('SELECT * FROM `users` WHERE `id`="'+message.author.id+'"')
        if (0 in users) {
            await message.client.sql('UPDATE `users` SET `xp`=`xp`+'+xp+' WHERE `id`="'+message.author.id+'"')
            this.giveRole(message)
        } else {
            await message.client.sql('INSERT INTO `users` (`id`, `xp`) VALUES ("'+message.author.id+'", '+xp+')')
        }
    },
    async giveRole(message) {
        const users = await message.client.sql('SELECT * FROM `users` WHERE `id`="'+message.author.id+'"')

        const level = this.getLevel(users[0].xp)[0]
        
        let roles = await message.client.sql('SELECT * FROM `servers` WHERE `id`="'+message.guild.id+'"')
        roles = JSON.parse(roles[0].xprole)

        for (i = 0; i < Object.keys(roles).length; i++) {
            if ((level >= Object.keys(roles)[i]) && (level < Object.keys(roles)[i+1])) {
                message.member.roles.add(roles[Object.keys(roles)[i]])
                if (i != 0) message.member.roles.remove(roles[Object.keys(roles)[i-1]])
            }
        }
    },
    getLevel(xp) {
        let level = 0, rankup = 100, total = xp
        while (rankup < total) {
            total -= rankup
            level += 1
            rankup = 5*(level*level) + 50*level + 100
        }

        return [level, rankup, total]
    }
}
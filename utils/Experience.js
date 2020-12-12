module.exports.Experience = class Experience {
    constructor(User) {
        let level = 0, cost = 100, remaining = User.xp, total = User.xp
        while (cost < remaining) {
            remaining -= cost
            level += 1
            cost = 5*(level*level) + 50*level + 100
        }

        this.User = User
        this.total = total
        this.level = level
        this.progress = {
            remaining: remaining, 
            cost: cost
        }
    }

    // ----- Actions -----
    give(value) {
        this.User.client.query('UPDATE `users` SET `xp`=`xp`+'+value+' WHERE `id`="'+this.User.id+'"')
        this.update(message)
    }
    take(value) {
        this.User.client.query('UPDATE `users` SET `xp`=`xp`-'+value+' WHERE `id`="'+this.User.id+'"')
        this.update(message)
    }
    set(value) {
        this.User.client.query('UPDATE `users` SET `xp`='+value+' WHERE `id`="'+this.User.id+'"')
        this.update(message)
    }
    async update(message) {
        let xproles = await message.client.query('SELECT `xproles` FROM `servers` WHERE `id`="'+message.guild.id+'"')
        xproles = JSON.parse(xproles.getAll())
        if (xproles !== null && this.level >= 5) {
            if (this.level >= 10) {message.member.roles.remove(xproles[Math.floor(this.level/5)-2])}
            message.member.roles.add(xproles[Math.floor(this.level/5)-1])
        }
    }
}
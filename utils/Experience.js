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
        this.update()
    }
    take(value) {
        this.User.client.query('UPDATE `users` SET `xp`=`xp`-'+value+' WHERE `id`="'+this.User.id+'"')
        this.update()
    }
    set(value) {
        this.User.client.query('UPDATE `users` SET `xp`='+value+' WHERE `id`="'+this.User.id+'"')
        this.update()
    }
    update(message) {
        // Update roles here
        let xproles = await message.client.query('SELECT `xproles` FROM `servers` WHERE `id`="'+message.guild.id+'"')
        if (xproles !== null) {
            xproles = JSON.parse(xproles) // = list(lvl1, lvl2, lvl3) where lvl = role snowflake
        }

        /* ----- OLD -----

        let {xproles} = await message.client.sql('SELECT `xproles` FROM `servers` WHERE `id`="'+message.guild.id+'"')
        if (xproles !== null && xproles !== undefined) {
            roles = JSON.parse(xproles)

            const users = await message.client.sql('SELECT * FROM `users` WHERE `id`="'+message.author.id+'"')
            const level = this.getLevel(users[0].xp)[0]

            for (i = 0; i < Object.keys(roles).length; i++) {
                if ((level >= Object.keys(roles)[i]) && (level < Object.keys(roles)[i+1])) {
                    message.member.roles.add(roles[Object.keys(roles)[i]])
                    if (i != 0) message.member.roles.remove(roles[Object.keys(roles)[i-1]])
                }
            }
        }
        */
    }
}
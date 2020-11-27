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
    }
}
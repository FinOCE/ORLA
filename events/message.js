module.exports = (client, message) => {
    const moment = require('moment-timezone')

    // Don't run if message is sent by bot, or doesn't start with the prefix
    if (message.author.bot) return

    // Give xp where applicable
    if (!(message.author.id in client.xpEarnt) && message.guild.id === '690588183683006465') {
        client.xpEarnt[message.author.id] = moment().unix() + 60

        client.xp.addXP(message, message.author.id, 11, 15);

        (async () => {
            const {User} = require('../utils/User')
            const user = await User.build(client, message.author.id)
            await user.Experience().update(message)
        })()

        client.setTimeout(_ => {
            delete client.xpEarnt[message.author.id]
        }, 60000)
    }

    // Check if message is a command
    if (!message.content.startsWith(client.config.prefix)) return

    const args = message.content.slice(client.config.prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()

    // Get command, check if it exists, and make sure the user has permission to use it
    const cmd = client.commands.get(command)
    if (!cmd) return

    if ((cmd.category === 'staff') && !message.member.hasPermission('MANAGE_MESSAGES')) {
        client.error('invalidPermission', message)
        return
    }
    if ((cmd.onlyORLA !== undefined) && (message.guild.id !== '690588183683006465')) {
        message.delete().then(() => {
            client.error('notMainServer', message)
        })
        return
    }

    // Delete command message and run command
    message.delete().then(_ => {
        cmd.run(message, args)
    })
}
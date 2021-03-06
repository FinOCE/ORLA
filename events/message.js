module.exports = (client, message) => {
    const moment = require('moment-timezone')

    // Ignore DMs
    if (message.channel.type === 'dm') return

    // Separate development bot channel actions
    if (message.channel.name.includes('dev-') && process.env.dev !== 'true') return

    // Don't run if message is sent by bot, or doesn't start with the prefix
    if (message.author.bot) return

    // Give xp where applicable
    if (!(message.author.id in client.xpFromMessage) && message.guild.id === '690588183683006465') {
        client.xpFromMessage.push([message.author.id])

        {(async () => {
            const User = require('../utils/User')
            const user = await User.build(client, message.author.id)
            user.orla.xp.giveFromMessage()
            user.orla.xp.update(message)
        })()}

        client.setTimeout(() => {
            delete client.xpFromMessage[message.author.id]
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
        client.error('invalidPermission', message).send()
        return
    }
    if ((cmd.onlyORLA !== undefined) && (message.guild.id !== '690588183683006465')) {
        message.delete().then(() => {
            client.error('notMainServer', message).send()
        })
        return
    }

    // Delete command message and run command
    message.delete().then(() => {
        cmd.run(message, args)
    })
}
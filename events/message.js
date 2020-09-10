module.exports = (client, message) => {
    // Don't run if message is sent by bot, or doesn't start with the prefix
    if (message.author.bot) return
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

    // Delete command message and run command
    message.delete().then(_ => {
        cmd.run(message, args)
    })
}
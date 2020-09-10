module.exports = (client, message) => {
    // Don't run if message is sent by bot, or doesn't start with the prefix
    if (message.author.bot) return
    if (!message.content.startsWith(client.config.prefix)) return

    const args = message.content.slice(client.config.prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()

    // Get command and run if it exists
    const cmd = client.commands.get(command)
    if (!cmd) return
    cmd.run(message, args)
}
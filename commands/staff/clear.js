module.exports = {
    desc: "clears most recent messages",
    syntax: "[1-100]*",
    async run(message, args) {
        // Check if the amount specified is valid
        const count = parseInt(args[0])
        if (isNaN(count) || count < 1 || count > 100) {
            message.client.error('invalidSyntax', message, args)
            return
        }

        // Delete specified number of messages
        message.channel.bulkDelete(count, true).catch(err => console.error(err))
    }
}
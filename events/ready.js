module.exports = async (client) => {
    // Set status and show the bot is running
    console.log('Bot is now online')
    client.user.setActivity('orla.pro | .help', { type: 'WATCHING' })

    // Execute functions on an interval
    client.setInterval(function update() {
        // code here
        return update
    }(), client.config.timeout * 1000)
}
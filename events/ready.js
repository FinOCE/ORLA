module.exports = (client) => {
    console.log('Bot is now online')
    client.user.setActivity('orla.pro | .help', { type: 'WATCHING' })

    client.setInterval(function update() {
        // code here
        return update
    }(), client.config.timeout * 1000)
}
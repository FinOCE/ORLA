module.exports = async (client) => {
    // Set status and show the bot is running
    console.log('Bot is now online')
    client.user.setActivity('orla.pro | .help', {type: 'WATCHING'})

    // Execute functions on an interval
    client.setInterval(function update() {
        // Create server list
        (async () => {
            const servers = await client.query('SELECT * FROM `servers`')
            servers.getAll().forEach(server => {
                server.upcoming = JSON.parse(server.upcoming)
                server.autorole = JSON.parse(server.autorole)
                server.rankroles = JSON.parse(server.rankroles)
            })
            client.servers = servers.getAll()
        })()

        return update
    }(), client.config.timeout * 1000)
}
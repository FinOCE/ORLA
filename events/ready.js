module.exports = async (client) => {
    // Set status and show the bot is running
    console.log('Bot is now online')
    client.user.setActivity('orla.pro | .help', { type: 'WATCHING' })

    // Execute functions on an interval
    client.setInterval(function update() {
        // Create server list
        (async () => {
            const serverSQL = await client.sql('SELECT * FROM `servers`')

            const servers = {}
            for (const server of serverSQL) {
                servers[server.id] = server
                servers[server.id].upcoming = JSON.parse(server.upcoming)
                servers[server.id].autorole = JSON.parse(server.autorole)
            }

            client.servers = servers
        })()

        return update
    }(), client.config.timeout * 1000)
}
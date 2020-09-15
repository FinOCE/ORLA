module.exports = async (client) => {
    // Set status and show the bot is running
    console.log('Bot is now online')
    client.user.setActivity('orla.pro | .help', { type: 'WATCHING' })

    // Functions to execute
    const announcements = require('../utils/announcements.js')
    const notifications = require('../utils/notifications.js')
    const upcoming = require('../utils/upcoming.js')

    // Execute functions on an interval
    client.setInterval(function update() {
        const hosts = require('../utils/hosts.js')
        const servers = require('../utils/servers.js')

        // Update hosts and servers and run announce/notify/update
        new Promise(async (resolve, reject) => {
            client.hosts = await hosts(client)
            client.servers = await servers(client)
            resolve(client)
        }).then(client => {
            announcements(client)
            notifications(client)
            upcoming(client)
        })

        return update
    }(), client.config.timeout * 1000)
}
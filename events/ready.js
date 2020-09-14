module.exports = async (client) => {
    // Set status and show the bot is running
    console.log('Bot is now online')
    client.user.setActivity('orla.pro | .help', { type: 'WATCHING' })

    // Functions to execute
    //const announcements = require('../utils/announcements.js')
    const notifications = require('../utils/notifications.js')
    //const upcoming = require('../utils/upcoming.js')

    // Execute functions on an interval
    client.setInterval(function update() {
        //announcements(client)
        notifications(client)
        //upcoming(client)

        return update
    }(), client.config.timeout * 1000)
}
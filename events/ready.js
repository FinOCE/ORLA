module.exports = async (client) => {
    // Set status and show the bot is running
    console.log('Bot is now online')
    client.user.setActivity('orla.pro | .help', { type: 'WATCHING' })

    // Execute functions on an interval
    client.setInterval(function update() {
        // Update server list
        (async () => {
            const servers = require('../utils/servers')
            client.servers = await servers(client)
        })()

        return update
    }(), client.config.timeout * 1000)

    /*
    // TODO: Add automation for announcing and notifying
    const {Event} = require('../utils/Event')
    const sql = await client.sql('SELECT * FROM `tournaments` WHERE `title`="RLO 2v2 198"')
    const event = await Event.build(client, sql)
    event.announce(client)
    */
}
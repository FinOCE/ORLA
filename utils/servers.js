module.exports = async (client) => {
    const serverSQL = await client.sql('SELECT * FROM `servers`')

    const servers = {}
    for (const server of serverSQL) {
        servers[server.id] = {
            id: server.id,
            timezone: server.timezone,
            upcoming: server.upcoming,
            message: server.message,
            announcements: server.announcements,
            notifications: server.notifications,
            joinleave: server.joinleave,
            autorole: JSON.parse(server.autorole),
            pingrole: server.pingrole
        }
    }
    
    return servers
}
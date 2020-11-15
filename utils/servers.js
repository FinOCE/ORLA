module.exports = async (client) => {
    const serverSQL = await client.sql('SELECT * FROM `servers`')

    const servers = {}
    for (const server of serverSQL) {
        servers[server.id] = server
        servers[server.id].upcoming = JSON.parse(server.upcoming)
        servers[server.id].autorole = JSON.parse(server.autorole)
    }
    
    return servers
}
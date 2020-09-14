module.exports = async (client) => {
    const hostSQL = await client.sql('SELECT * FROM `hosts`')

    const hosts = []
    for (const host of hostSQL) {
        hosts[host.name] = {
            title: host.title,
            name: host.name,
            emoji: host.emoji,
            logo: `https://orla.pro/assets/hosts/${host.name}.png`,
            color: host.color,
            series: JSON.parse(host.series)
        }
    }

    return hosts
}
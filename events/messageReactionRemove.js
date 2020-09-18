module.exports = async (client, reaction, user) => {
    if (user.bot) return

    client.roles.removeStateRole(client, reaction, user)
}
module.exports = async (client, reaction, user) => {
    if (user.bot) return

    client.roles.addStateRole(client, reaction, user)
}
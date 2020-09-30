module.exports = {
	desc: 'give or take a user\'s XP',
	syntax: '[@user]* [amount]*',
	async run(message, args) {
		// Only run command if the args are valid
		if (isNaN(args[1])) return
		if (message.mentions.members.first() == undefined) return

		const newXP = await message.client.xp.giveXP(message, args[1])
    }
}
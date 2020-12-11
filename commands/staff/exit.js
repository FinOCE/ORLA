module.exports = {
	desc: 'shuts down the bot',
	syntax: '',
	onlyORLA: true,
	run(message, args) {
        process.exit(1)
	}
}
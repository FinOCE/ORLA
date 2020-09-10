module.exports = {
	desc: 'shuts down the bot',
	syntax: '',
	execute(message, args) {
        process.exit(1)
	}
}
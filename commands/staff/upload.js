module.exports = {
	desc: 'uploads tournament to the system',
	syntax: '',
	async run(message, args) {
		const {Event} = require('../../utils/Event')
		const event = new Event()
		
		// ----- NAME ----
		event.name = await event.query(message, 'What is the name of the tournament?')

		// ----- HOST & SERIES -----
		let validHost = false
		while (validHost == false) {
			const backend = await event.query(message, 'What is the series/host code?')
			let query = await message.client.query('SELECT * FROM `hosts` WHERE `series` LIKE "%'+backend+'%"')

			const seriesToCheck = {}
			Object.keys(query.json).forEach(host => {
				const series = JSON.parse(query.json[host].series)
				Object.keys(series).forEach(code => {
					if (code.includes(backend)) {
						seriesToCheck[code] = series[code]
					}
				})
			})

			query = await message.client.query('SELECT * FROM `hosts` WHERE `name` LIKE "%'+backend+'%"')
			const hostsToCheck = query.getAll()

			if (Object.keys(seriesToCheck).length === 0 && hostsToCheck.length === 0) {
				message.channel.send('Sorry, but that series/host could not be found. Please try again.')
			}

			if ((Object.keys(seriesToCheck).length === 0 && hostsToCheck.length === 1) || (Object.keys(seriesToCheck).length === 1 && hostsToCheck.length === 0)) {
				validHost = true
			}
			
			if (Object.keys(seriesToCheck).length + hostsToCheck.length > 1) {
				let list = ''
				for (let i = 0; i < Object.keys(seriesToCheck).length; i++) {
					list += `${i+1}. ${Object.keys(seriesToCheck)[i]} (series)\n`
				}
				const seriesLength = list.split('\n').length
				for (let i = 0; i < hostsToCheck.length; i++) {
					list += `${i+seriesLength}. ${hostsToCheck[i].name} (host)\n`
				}

				let validSelection = false
				while (validSelection == false) {
					message.channel.send(`We found multiple series/hosts with that string included in their code, which one did you mean?\n${list}`)
					
					const option = await event.query(message)
					if (option-1 > list.split('\n').length || option-1 < 0) {
						message.channel.send('Sorry, but that option is not valid. Please try again.')
					} else {
						if (option-1 <= Object.keys(seriesToCheck).length) {
							query = await message.client.query('SELECT * FROM `hosts` WHERE `series` LIKE "%'+Object.keys(seriesToCheck)[option-1]+'%"')
							event.host = query.getFirst().name
							event.series = Object.keys(seriesToCheck)[option-1]
						} else {
							event.host = hostsToCheck[option-1-Object.keys(seriesToCheck).length].name
							event.series = null
						}

						validSelection = true
					}
				}

				validHost = true
			}
		}

		// ----- URL -----
		event.URL = await event.query(message, 'What is the URL to the registration page?')

		// ----- CUSTOM URL -----
		event.customURL = await event.query(message, 'What do you want the custom URL to be for the ORLA redirect?')

		// ----- STREAM URL -----
		event.streamURL = await event.query(message, 'What is the URL to the stream page? If there is none, type anything except a link.')

		// ----- PRIZE -----
		event.prize = await event.query(message, 'What is the total prize pool for the event?')

		// ----- OPEN -----
		const open = await event.query(message, 'Is the event open for anyone to join? If so, type anything including the letter Y.')
		event.open = (open.toLowerCase().includes('y')) ? true : false

		// ----- START TIME -----
		validStartTime = false
		while (validStartTime == false) {
			startTime = await event.query(message, 'When does the event start? (format: D-M hh:mm, e.g. 16-3 18:00')
			// TODO: convert to unix before setting
		}

		// ----- REGISTRATION TIME -----
		validRegistrationTime = false
		while (validRegistrationTime == false) {
			registrationTime = await event.query(message, 'When does registration close? (format: D-M hh:mm, e.g. 16-3 18:00')
			// TODO: copy valid conversion code from startTime part
		}

		// TODO: confirmation and upload
    }
}
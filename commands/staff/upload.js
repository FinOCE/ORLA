module.exports = {
	desc: 'uploads tournament to the system',
	syntax: '',
	async run(message, args) {
		const Discord = require('discord.js')
		const moment = require('moment-timezone')

		const {Event} = require('../../utils/Event')
		const event = new Event()

		new Promise(async (resolve, reject) => {
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

				if (Object.keys(seriesToCheck).length === 1 && hostsToCheck.length === 0) {
					query = await message.client.query('SELECT * FROM `hosts` WHERE `series` LIKE "%'+Object.keys(seriesToCheck)[0]+'%"')
					event.host = query.getFirst().name
					event.series = Object.keys(seriesToCheck)[0]
					validHost = true
				}

				if (Object.keys(seriesToCheck).length === 0 && hostsToCheck.length === 1) {
					event.host = hostsToCheck[0].name
					event.series = null
					validHost = true
				}
				
				if (Object.keys(seriesToCheck).length + hostsToCheck.length > 1) {
					let list = ''
					for (let i = 0; i < Object.keys(seriesToCheck).length; i++) {
						list += `**${i+1}.** \`${Object.keys(seriesToCheck)[i]}\` (series)\n`
					}
					const seriesLength = list.split('\n').length
					for (let i = 0; i < hostsToCheck.length; i++) {
						list += `**${i+seriesLength}.** \`${hostsToCheck[i].name}\` (host)\n`
					}

					let validSelection = false
					while (validSelection == false) {
						let validNumber = false
						let option = null
						while (validNumber == false) {
							message.channel.send(`We found multiple series/hosts with that string included in their code, which one did you mean?\n${list}`)

							option = await event.query(message)
							if (!isNaN(option) && (option <= Object.keys(seriesToCheck).length + hostsToCheck.length) && (option > 0)) {
								validNumber = true
							} else {
								message.channel.send('Sorry, but that option is not valid. Please try again.')
							}
						}

						if (option-1 < Object.keys(seriesToCheck).length) {
							query = await message.client.query('SELECT * FROM `hosts` WHERE `series` LIKE "%'+Object.keys(seriesToCheck)[option-1]+'%"')
							event.host = query.getFirst().name
							event.series = Object.keys(seriesToCheck)[option-1]
						} else {
							event.host = hostsToCheck[option-1-Object.keys(seriesToCheck).length].name
							event.series = null
						}

						validSelection = true
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
			let validStartTime = false
			while (validStartTime == false) {
				startTime = await event.query(message, 'When does the event start? *(format like: 16/3 18:00 +11)*')
				if (/\d+\/\d+\s\d+:\d{2}\s\+\d{2}/.test(startTime)) {
					validStartTime = true
					const time = {
						month: startTime.split('/')[1].split(' ')[0]-1,
						day: startTime.split('/')[0],
						hour: startTime.split(' ')[1].split(':')[0],
						minutes: startTime.split(':')[1].split(' ')[0]
					}
					const tz = startTime.split(' ')[2].replace('+', '')
					event.startTime = moment(time).utcOffset(tz).utc().unix()
				} else {
					message.channel.send('Sorry, but that time is not formatted correctly. Please try again.')
				}
			}

			// ----- REGISTRATION TIME -----
			let validRegistrationTime = false
			while (validRegistrationTime == false) {
				registrationTime = await event.query(message, 'When does registration close? *(format like: 16/3 18:00 +11)*')
				if (/\d+\/\d+\s\d+:\d{2}\s\+\d{2}/.test(startTime)) {
					validRegistrationTime = true
					const time = {
						month: startTime.split('/')[1].split(' ')[0]-1,
						day: startTime.split('/')[0],
						hour: startTime.split(' ')[1].split(':')[0],
						minutes: startTime.split(':')[1].split(' ')[0]
					}
					const tz = startTime.split(' ')[2].replace('+', '')
					event.registrationTime = moment(time).utcOffset(tz).utc().unix()
					resolve(event)
				} else {
					message.channel.send('Sorry, but that time is not formatted correctly. Please try again.')
				}
			}
		}).then(async (event) => {
			const submit = await event.query(message, 'Is this correct? If yes, type anything including the letter Y.\n```js\n'+JSON.stringify(event, null, 4)+'\n```')
			if (submit.toLowerCase().includes('y')) {
				message.client.query(`INSERT INTO \`tournaments\` VALUES ("${event.name}", "${event.series}", "${event.host}", "${event.mode}", ${event.startTime}, ${event.open}, "${event.URL}", "${event.customURL}", "${event.prize}", ${event.rtime}, "${event.streamURL}", 0, 0)`)
				/*
				TODO: Determine reason for this error when running above code

				(node:2064) UnhandledPromiseRejectionWarning: SequelizeDatabaseError: Unknown column 'undefined' in 'field list'
					at Query.formatError (...\node_modules\sequelize\lib\dialects\mysql\query.js:239:16)
					at Query.run (...\node_modules\sequelize\lib\dialects\mysql\query.js:54:18)
					at processTicksAndRejections (internal/process/task_queues.js:97:5)
				*/
			} else {
				message.channel.send('Upload cancelled.')
			}
		})
    }
}
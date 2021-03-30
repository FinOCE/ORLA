module.exports = {
	description: 'uploads tournament to the system',
	syntax: '',
	onlyORLA: true,
	async run(message, args) {
		const Discord = require('discord.js')
		const moment = require('moment-timezone')
		const Tournament = require('../../utils/Tournament').default

		const event = {}//new (require('../../utils/Tournament').default)			
		new Promise(async (resolve, reject) => {
			// ----- NAME ----
			event.name = await Tournament.query(message, 'What is the name of the tournament?')
			if (!event.name) return

			// ----- HOST & SERIES -----
			let validHost = false
			while (validHost == false) {
				const backend = await Tournament.query(message, 'What is the series/host code?')
				if (!backend) return
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

							option = await Tournament.query(message)
							if (!option) return
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

			// ----- MODE -----
			event.mode = await Tournament.query(message, 'What mode is the event?')
			if (!event.mode) return

			// ----- URL -----
			event.URL = await Tournament.query(message, 'What is the URL to the registration page?')
			if (!event.URL) return

			// ----- CUSTOM URL -----
			event.customURL = await Tournament.query(message, 'What do you want the custom URL to be for the ORLA redirect?')
			if (!event.customURL) return

			// ----- STREAM URL -----
			const streamURL = await Tournament.query(message, 'What is the URL to the stream page? If there is none, type anything except a link.')
			if (!event.streamURL) return
			event.streamURL = (streamURL.toLowerCase().indexOf('http') !== -1) ? streamURL : null

			// ----- PRIZE -----
			event.prize = await Tournament.query(message, 'What is the total prize pool for the event?')
			if (!event.prize) return

			// ----- OPEN -----
			const open = await Tournament.query(message, 'Is the event open for anyone to join? If so, type anything including the letter Y.')
			if (!event.open) return
			event.open = (open.toLowerCase().includes('y'))

			// ----- START TIME -----
			let validStartTime = false
			while (validStartTime == false) {
				startTime = await Tournament.query(message, 'When does the event start? *(format like: 16/3 18:00 +11)*')
				if (!startTime) return
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
				registrationTime = await Tournament.query(message, 'When does registration close? *(format like: 16/3 18:00 +11)*')
				if (!registrationTime) return
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
			const submit = await Tournament.query(message, 'Is this correct? If yes, type anything including the letter Y.\n```js\n'+JSON.stringify(event, null, 4)+'\n```')
			if (!submit) return
			if (submit.toLowerCase().includes('y')) {
				let topen = (event.open) ? 1 : 0
				const series = (event.series !== null) ? `"${event.series}"` : 'NULL'
				const streamURL = (event.streamURL !== null) ? `"${event.streamURL}"` : 'NULL'
				message.client.query('INSERT INTO `tournaments` VALUES("'+event.name+'", '+series+', "'+event.host+'", "'+event.mode+'", "'+event.startTime+'", "'+topen+'", "'+event.URL+'", "'+event.customURL+'", "'+event.prize+'", "'+event.registrationTime+'", '+streamURL+', 0, 0)')
				message.channel.send('Event successfully uploaded.')
			} else {
				message.channel.send('Upload cancelled.')
			}
		})
    }
}
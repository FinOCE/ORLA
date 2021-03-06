import Client from './utils/Client'

require('dotenv').config()
new Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']}).login(process.env.token)
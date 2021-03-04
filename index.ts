// Create Discord client
import Client from './utils/Client'
const client: Client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

// Login
require('dotenv').config()
client.login(process.env.token)
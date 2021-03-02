// Create Discord client
import Discord from 'discord.js'
const client: any = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
client.config = require('./config.json')

// Error function
import {Error} from './utils/Error'
client.error = (method: string, message: object) => new Error(method, message)

// SQL Function
const {Database} = require('./utils/Database')
client.query = (sql: string) => Database.query(sql)

// Set XP timer storage for messages and voice chats
client.xpFromMessage = []
client.xpFromVoice = {}

// Import modules
require('dotenv').config()
const { glob } = require('glob')
import {parse} from 'path'

// Load events
glob('./events/*.js', (err: string, files: Array<string>) => {
    if (err) throw err
    files.forEach(file => {
        const {name} = parse(file)
        
        const event = require(file)
        client.on(name, event.bind(null, client))
    })
})

// Load commands
client.commands = new Discord.Collection()
glob('./commands/**/*.js', (err: string, files: string[]) => {
    if (err) throw err
    files.forEach(file => {
        const {dir, name} = parse(file)
        const category = dir.split('/').pop()
        
        const command = require(file)
        command.category = category
        command.name = name
        client.commands.set(name, command)
    })
})

// Login
client.login(process.env.token)
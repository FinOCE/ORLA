// Create Discord client
import Discord from 'discord.js'
const client: any = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

// Add functions and config to client object
import {Error} from './utils/Error'
import {Database} from './utils/Database'

Object.assign(client, {
    config: require('./config.json'),
    error: (method: string, message: object) => new Error(method, message),
    query: (sql: string) => Database.query(sql)
})

// Import modules
require('dotenv').config()
const {glob} = require('glob')
import {parse} from 'path'

// Load events
glob('./events/+(*.js|*.ts)', (err: string, files: Array<string>) => {
    if (err) throw err
    files.forEach(file => {
        const {name} = parse(file)
        
        const event = require(file)
        client.on(name, event.bind(null, client))
    })
})

// Load commands
client.commands = new Discord.Collection()
glob('./commands/**/+(*.js|*.ts)', (err: string, files: string[]) => {
    if (err) throw err
    files.forEach(file => {
        const {dir, name} = parse(file)
        const category = dir.split('/').pop()
        
        const command = require(file)
        Object.assign(command, {category, name})
        client.commands.set(name, command)
    })
})

// Login
client.login(process.env.token)
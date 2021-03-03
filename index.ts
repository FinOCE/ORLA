// Create Discord client
import Client from './utils/Client'
const client: Client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

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
glob('./commands/**/+(*.js|*.ts)', (err: string, files: Array<string>) => {
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
const Discord = require('discord.js')
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
client.config = require('./config.json')
const {Error} = require('./utils/Error')
client.error = (method, message) => new Error(method, message)

// SQL Function
const {Database} = require('./utils/Database')
client.query = (sql) => Database.query(sql)

// Set XP timer storage for messages and voice chats
client.xpFromMessage = []
client.xpFromVoice = {}

require('dotenv').config()

const { glob } = require('glob')
const { parse } = require('path')

// Load events
glob('./events/*.js', (_, files) => {
    files.forEach(file => {
        const {name} = parse(file)
        
        const event = require(file)
        client.on(name, event.bind(null, client))
    })
})

// Load commands
client.commands = new Discord.Collection()
glob('./commands/**/*.js', (_, files) => {
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
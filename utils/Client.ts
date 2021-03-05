import {Client as ClientJS, Collection, ClientOptions, Message} from 'discord.js'
const {glob} = require('glob')
import {parse} from 'path'

import Command, {CommandOptions} from './Command'
import {Error} from './Error'
import {Database} from './Database'

export default class Client extends ClientJS {
    commands: Collection<string, CommandOptions>
    config: Record<string, string>
    xpFromVoice: Record<string, void>
    xpFromMessage: Array<string>
    servers: Record<string, any>
    hosts: Record<string, any>

    constructor(options?: ClientOptions) {
        super(options)
        this.commands = new Collection()
        this.config = require('../config.json')
        this.xpFromVoice = {}
        this.xpFromMessage = []
        this.servers = {}
        this.hosts = {}

        glob('./commands/**/*+(.js|.ts)', (err: string, files: Array<string>) => {
            if (err) throw err
            files.map(f => {return `.${f}`}).forEach(file => {
                const {dir, name} = parse(file)
                const category = dir.split('/').pop()

                if (file.endsWith('js')) {
                    // JavaScript commands
                    const command = require(file)
                    Object.assign(command, {category, name})
                    this.commands.set(name, command)
                } else if (file.endsWith('ts')) {
                    // TypeScript commands
                    const command = new (require(file).default)(this, {name, category})
                    this.commands.set(name, command)
                }
            })
        })

        glob('./events/*+(.js|.ts)', (err: string, files: Array<string>) => {
            if (err) throw err
            files.map(f => {return `.${f}`}).forEach(file => {
                const {name} = parse(file)

                if (file.endsWith('js')) {
                    const event = require(file)
                    this.on(name, event.bind(null, this))
                } else if (file.endsWith('ts')) {
                    const event = new (require(file).default)(this)
                    this.on(name, (...args) => event.run(...args))
                }
            })
        })
    }

    error(method: string, message: Message) {
        return new Error(method, message)
    }
    query(sql: string) {
        return Database.query(sql)
    }
}
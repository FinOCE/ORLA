import {Client as ClientJS, Collection, ClientOptions} from 'discord.js'
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
                    const Command = require(file).default
                    const command = new Command(this, {name, category})
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
                    const Event = require(file).default
                    const event = new Event()
                    this.on(name, event.run.bind(null, this))
                }
            })
        })
    }

    error(method: string, message: object) {
        return new Error(method, message)
    }
    query(sql: string) {
        return Database.query(sql)
    }
}
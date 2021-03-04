import {Client as ClientJS, Collection, ClientOptions} from 'discord.js'
const {glob} = require('glob')
import {parse} from 'path'

import Command, {CommandOptions} from './Command'
import {Error} from './Error'
import {Database} from './Database'

export default class Client extends ClientJS {
    commands: Collection<string, CommandOptions>
    config: Record<string, string>

    constructor(options?: ClientOptions) {
        super(options)
        this.commands = new Collection()
        this.config = require('../config.json')

        glob('./commands/**/*+(.j|.t)s', (err: string, files: Array<string>) => {
            if (err) throw err
            files.map(f => {return `.${f}`}).forEach(file => {
                if (file.endsWith('js')) {
                    const {dir, name} = parse(file)
                    const category = dir.split('/').pop()
                    
                    const command = require(file)
                    Object.assign(command, {category, name})
                    this.commands.set(name, command)
                } else if (file.endsWith('ts')) {
                    const File = require(file).default
                    if (File && File.prototype instanceof Command) {
                        const command: Command = new File
                        command.client = this
                        this.commands.set(command.name, command)
                    }
                }
            })
        })

        glob('./events/*+(.j|.t)s', (err: string, files: Array<string>) => {
            if (err) throw err
            files.map(f => {return `.${f}`}).forEach(file => {
                const {name} = parse(file)
                
                const event = require(file)
                this.on(name, event.bind(null, this))
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
import {Client as ClientJS, Collection, ClientOptions, Message, MessageEmbed} from 'discord.js'
const {glob} = require('glob')
import {parse} from 'path'

import {CommandOptions} from './Command'
import Server from './Server'
import Host from './Host'
import Error from './Error'
import Database from './Database'

export default class Client extends ClientJS {
    commands: Collection<string, CommandOptions>
    config: Record<string, string>
    xpFromVoice: Record<string, void>
    xpFromMessage: Array<string>
    servers: Record<string, Server>
    hosts: Record<string, Host>
    errors: Record<string, Error>

    constructor(options?: ClientOptions) {
        super(options)
        this.commands = new Collection()
        this.config = require('../config.json')
        this.xpFromVoice = {}
        this.xpFromMessage = []
        this.servers = {}
        this.hosts = {}
        this.errors = {}

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
        return new class {
            private client: Client
            private message: Message
            public error: Error

            constructor(client: Client, message: Message, method: string) {
                this.client = client
                this.message = message
                this.error = client.errors[method]
            }

            createEmbed() {
                const Embed = new MessageEmbed()
                    .setColor(this.client.config.color)
                    .setFooter(`ORLA - Requested by ${this.message.author.tag}`, this.client.config.logo)
                    .setTitle('Error: ' + this.error.title)
                    .setDescription(this.error.description.replace(/%PREFIX%/g, this.client.servers[this.message.guild!.id].prefix))

                return Embed
            }
        
            send() {
                const Embed = this.createEmbed()
                this.message.channel.send(Embed)
            }
        }(this, message, method)
    }
    query(sql: string) {
        return Database.query(sql)
    }
}
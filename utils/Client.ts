import {Client as ClientJS, Collection, ClientOptions} from 'discord.js'

import {Error} from './Error'
import {Database} from './Database'

export default class Client extends ClientJS {
    commands: Collection<string, Function>
    config: object

    constructor(options?: ClientOptions) {
        super(options)
        this.commands = new Collection()
        this.config = require('../config.json')
    }

    error(method: string, message: object) {
        return new Error(method, message)
    }
    query(sql: string) {
        return Database.query(sql)
    }
}
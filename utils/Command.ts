import {Message} from 'discord.js';
import Client from './Client'

export interface CommandOptions {
    name: string
    category: string
}

export default abstract class Command implements CommandOptions {
    client: Client
    name: string
    category: string

    constructor(client: Client, options: CommandOptions) {
        this.client = client
        this.name = options.name
        this.category = options.category
    }

    abstract run(message: Message, args?: Array<string>): void | Promise<void>
}
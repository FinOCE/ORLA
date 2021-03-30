import {Message} from 'discord.js';
import Client from './Client'

export interface CommandOptions {
    name: string
    category: string
    onlyORLA: boolean
}

export default abstract class Command {
    public client: Client
    public name: string
    public category: string
    public onlyORLA: boolean
    public description: string
    public syntax: string

    constructor(client: Client, options: CommandOptions) {
        this.client = client
        this.name = options.name
        this.category = options.category
        this.onlyORLA = options.onlyORLA ?? false
        this.description = ''
        this.syntax = ''
    }

    abstract run(message: Message, args?: Array<string>): void | Promise<void>
}
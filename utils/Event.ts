import Client from './Client'

export default abstract class Event {
    constructor() {}
    
    abstract run(client: Client, ...args: Array<any>): void | Promise<void>
}
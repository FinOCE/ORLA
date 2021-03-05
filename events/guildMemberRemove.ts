import {GuildMember, TextChannel} from 'discord.js'
import Client from '../utils/Client'
import Event from '../utils/Event'

export default class Ready extends Event {
    constructor() {
        super()
    }

    run(client: Client, member: GuildMember) {
        const server = client.servers[member.guild.id]

        // Send message to join/leave channel
        if (server.joinleave?.text) {
            const channel = client.channels.cache.find(channels => channels.id === server.joinleave.text)
            {(channel! as TextChannel).send(`${member.user} has **left** the server`)}
        }

        // Update member counter
        if (server.joinleave?.counter) {
            const counter = client.channels.cache.find(c => c.id === server.joinleave.counter)
            {(counter! as TextChannel).setName(`Members: ${member.guild.memberCount-1}`)}
        }
    }
}
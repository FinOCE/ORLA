import {GuildMember, TextChannel} from 'discord.js'
import Client from '../utils/Client'
import Event from '../utils/Event'

export default abstract class guildMemberAdd extends Event {
    constructor(client: Client) {
        super(client)
    }

    run(member: GuildMember) {
        const server = this.client.servers[member.guild.id]

        // Give user autoroles
        if (server.autorole) {
            for (const i in server.autorole) {
                member.roles.add(server.autorole[i])
            }
        }

        // Send message to join/leave channel
        if (server.joinleave?.text) {
            const channel = this.client.channels.cache.find(channels => channels.id === server.joinleave.text)
            {(channel! as TextChannel).send(`${member.user} has **joined** the server`)}
        }

        // Update member counter
        if (server.joinleave?.counter) {
            const counter = this.client.channels.cache.find(c => c.id === server.joinleave.counter)
            {(counter! as TextChannel).setName(`Members: ${member.guild.memberCount-1}`)}
        }
    }
}
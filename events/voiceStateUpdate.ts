import {VoiceState} from 'discord.js'
import Client from '../utils/Client'
import Event from '../utils/Event'

export default abstract class voiceStateUpdate extends Event {
    constructor(client: Client) {
        super(client)
    }

    async run(from: VoiceState, to: VoiceState) {
        if (!to.channelID || to.channelID === this.client.servers[to.guild.id].afk) clearInterval(this.client.xpFromVoice[to.id])

        const user = await (require('../utils/User').default).build(this.client, to.id)
        this.client.xpFromVoice[to.id] = this.client.setInterval(() => {
            user.orla.xp.giveFromVoice()
        }, 60000)
    }
}
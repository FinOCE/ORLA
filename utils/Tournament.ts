import {Message, MessageEmbed, TextChannel} from 'discord.js'
import moment from 'moment-timezone'

import Client from './Client'
import Host from './Host'
import Series from './Series'

export default class Tournament {
    private client: Client
    public name: string
    public URL: string
    public customURL: string
    public streamURL: string
    public open: boolean
    public mode: string
    public prize: string
    public announced: boolean
    public reminded: boolean
    public startTime: number
    public registrationTime: number
    public host: Host
    public series: Series | null

    constructor(client: Client, data: Record<string, any>) {
        this.client = client
        this.name = data.title
        this.URL = data.link
        this.customURL = `https://orla.pro/events/${data.redirect}`
        this.streamURL = data.stream
        this.open = (data.topen === 1)
        this.mode = data.mode
        this.prize = data.prize
        this.announced = (data.announced === 1)
        this.reminded = (data.reminded === 1)
        this.startTime = data.ttime
        this.registrationTime = data.rtime
        this.host = new Host(client, data.host)
        this.series = (data.series) ? new Series(client, data.host, data.series) : null
    }

    addUpcomingField(Embed: MessageEmbed, {timezone}: Record<string, string>) {
        const icon = this.client.emojis.cache.get(this.client.hosts[this.host.code].emoji) ?? this.client.emojis.cache.get(this.client.config.defaultIcon)
        const stream = (this.streamURL) ? ` | [View Stream](${this.streamURL})` : ''

        const title = `${icon} **\`${this.name}\`**`
        const content = ''
        +`    [Registration Page](${this.customURL})${stream}\n\n`
        +`    Event Starts: **${moment.unix(this.startTime).tz(timezone).format('dddd Do MMMM h:mma')}**\n`
        +`    Rego Closes: **${moment.unix(this.registrationTime).tz(timezone).format('h:mma')}** (*${moment.unix(this.registrationTime - moment().unix()).format('D[d] H[hr] m[min]')}*)\n`
        +`    Format: **${this.mode}**\n`
        +`    Prize: **${this.prize}**\n`

        Embed.addField(title, content)
        return Embed
    }
    announce() {
        Object.values(this.client.servers).forEach(({timezone, announcements, pingrole}: Record<string, string>) => {
            if (!announcements) return
            const Embed = new MessageEmbed()
                .setColor(this.host.color)
                .setTitle(`\`${this.name}\``)
                .setURL(this.customURL)
                .setAuthor(this.host.name, this.host.logoURL)
                .setFooter('Tournament information provided by https://orla.pro', this.client.config.logo)
                .setThumbnail((this.series) ? this.series.logoURL : this.host.logoURL)
                .addField(`📋 **__Tournament Details__**`, 
                    `${(this.series) ? `Series: **${this.series.name}**\n` : ''}`
                    +`Mode: **${this.mode}**\nPrize Pool: **${this.prize}**\n\n`)
                .addField('🔗 **__Links__**',
                    `*You can enter this tournament by registering at:*\n➡️** ${this.customURL} **`
                    +`${(!this.open) ? '\n\n⚠️ ***Registration requires an invite***' : ''}`
                    +`${(this.streamURL) ? `\n\n*You can watch this tournament's live stream at:*\n➡️** ${this.streamURL} **` : ''}`)
                .addField('🕐 **__Schedule__**',
                    `\`\`\`http\nTournament Date:   ${moment.unix(this.startTime).tz(timezone).format('dddd Do MMMM')}`
                    +`\nRegistration Ends: ${moment.unix(this.registrationTime).tz(timezone).format('h:mma z')}`
                    +`\nTournament Starts: ${moment.unix(this.startTime).tz(timezone).format('h:mma z')}\n\`\`\``)
            
            const channel = this.client.channels.cache.find(c => c.id === announcements)
            if (channel) {
                (channel as TextChannel).send(pingrole ? `<@&${pingrole}>` : '', Embed).then(msg => {
                    if (msg.channel.type === 'news') msg.crosspost()
                })
            }
        })
        this.client.query('UPDATE `tournaments` SET `announced`=1 WHERE `title`="'+this.name+'"')
    }
    notify() {
        Object.values(this.client.servers).forEach(({timezone, notifications, pingrole}: Record<string, string>) => {
            if (!notifications) return
            const Embed = new MessageEmbed()
                .setColor(this.host.color)
                .setTitle(`\`${this.name}\``)
                .setURL(this.customURL)
                .setAuthor(this.host.name, this.host.logoURL)
                .setFooter('Tournament information provided by https://orla.pro', this.client.config.logo)
                .setThumbnail((this.series !== null) ? this.series.logoURL : this.host.logoURL)
                .setDescription(
                    '```fix\nREGISTRATION CLOSES IN ONE HOUR\n```\nRegistration for this tournament closes at **'
                    +moment.unix(this.registrationTime).tz(timezone).format('h:mma z')
                    +'**. To register or watch the tournament, follow the links below. The tournament starts at **'
                    +moment.unix(this.startTime).tz(timezone).format('h:mma z')+'**.')
                .addField('🔗 **__Links__**',
                    `*You can enter this tournament by registering at:*\n➡️** ${this.customURL} **`
                    +`${(!this.open) ? '\n\n⚠️ ***Registration requires an invite***' : ''}`
                    +`${(this.streamURL) ? `\n\n*You can watch this tournament's live stream at:*\n➡️** ${this.streamURL} **` : ''}`)
            
            const channel = this.client.channels.cache.find(c => c.id === notifications)
            if (channel) {
                (channel as TextChannel).send(pingrole ? `<@&${pingrole}>` : '', Embed).then(msg => {
                    if (msg.channel.type === 'news') msg.crosspost()
                })
            }
        })
        this.client.query('UPDATE `tournaments` SET `reminded`=1 WHERE `title`="'+this.name+'"')
    }

    static async query(message: Message, question: string) {
        return new Promise((resolve, reject) => {
            if (question) message.channel.send(question)

            const collecter = message.channel.createMessageCollector(m => m.author.id === message.author.id, {time: 300000})
            collecter.on('collect', (msg: Message) => {
                collecter.stop()
                if (msg.content.trim() === '.cancel') reject('cancel')
                resolve(msg.content)
            })
        }).catch(err => {
            message.channel.send('Upload cancelled.')
            return null
        })
    }
}
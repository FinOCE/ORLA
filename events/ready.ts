import {MessageEmbed, TextChannel} from 'discord.js'
import moment from 'moment-timezone'
import Client from '../utils/Client'
import Event from '../utils/Event'
import Tournament from '../utils/Tournament'

export default abstract class Ready extends Event {
    constructor(client: Client) {
        super(client)
    }

    run() {
        console.log('Bot is now online')
        this.client.user!.setActivity('orla.pro | .help', {type: 'WATCHING'})

        // Start website if running development build
        if (process.env.dev === 'true') require('../website/website')(this.client)

        const client = this.client
        this.client.setInterval(function u() {
            (async () => {
                // Update client.servers
                {(await client.query('SELECT * FROM `servers`'))?.getAll().forEach((server: Record<string, string>) => {
                    Object.entries(server).forEach(([key, value]) => {
                        if (value && /^[\[{]/.test(value)) server[key] = JSON.parse(value)
                    })
                    client.servers[server.id] = server
                })}

                // Update client.hosts
                {(await client.query('SELECT * FROM `hosts`'))?.getAll().forEach((host: Record<string, string>) => {
                    host.series = JSON.parse(host.series)
                    client.hosts[host.name] = host
                })}

                // Annoucements
                const announcementsQuery = 'SELECT * FROM `tournaments` WHERE `announced`=0 AND `ttime`>'+moment().unix()
                {(await client.query(announcementsQuery))?.getAll().forEach(async (tournament: Record<string, string>) => {
                    (new Tournament(client, tournament)).announce()
                })}

                // Notifications
                const notificationQuery = 'SELECT * FROM `tournaments` WHERE `reminded`=0 AND `rtime`<3600+'+moment().unix()+' AND `ttime`>'+moment().unix()
                {(await client.query(notificationQuery))?.getAll().forEach(async (tournament: Record<string, string>) => {
                    (new Tournament(client, tournament)).notify()
                })}

                // Upcoming
                const tournaments = (await client.query('SELECT * FROM `tournaments` WHERE `ttime`>'+moment().unix()))?.getAll()
                tournaments.sort((a: Record<string, any>, b: Record<string, any>) => {return Number(a.ttime) - Number(b.ttime)})

                Object.values(client.servers).forEach(async (server: Record<string, any>) => {
                    if (server.upcoming === null) return

                    // Get timezone offset in correct format
                    const tzHours = Math.floor(moment.tz(server.timezone).utcOffset() / 60)
                    const tzMinutes = (moment.tz(server.timezone).utcOffset() % 60 > 0) ? `:${moment.tz(server.timezone).utcOffset() % 60}` : ''
                    const tzOffset = (tzHours >= 0) ? `+${tzHours}${tzMinutes}` : `${tzHours}${tzMinutes}`

                    let Embed = new MessageEmbed()
                        .setColor(client.config.color)
                        .setFooter('Last Updated')
                        .setTimestamp()
                        .setTitle(`**Upcoming Tournaments - ${moment.tz(server.timezone).format('z')} (${tzOffset})**`)
                        .setURL('https://orla.pro')
                    
                    // Add content to Embed
                    if (tournaments.length === 0) Embed.setDescription('Unfortunately no events have been announced yet.')
                    tournaments.forEach(async (tournament: Record<string, string>) => {
                        const event = new Tournament(client, tournament)
                        Embed = event.addUpcomingField(Embed, server)
                    })
                    
                    // Fetch server's upcoming message and edit to update content
                    const channel = client.channels.cache.get(server.upcoming.channelID)
                    if (channel) {
                        (channel as TextChannel).messages.fetch(server.upcoming.messageID).then(msg => {
                            if (msg) msg.edit(Embed)
                        })
                    }
                })
            })()
            return u
        }(), Number(this.client.config.timeout) * 1000)
    }
}
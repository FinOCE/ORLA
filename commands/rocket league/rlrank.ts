import Command, {CommandOptions} from '../../utils/Command'
import {Message, MessageEmbed} from 'discord.js';
import moment from 'moment-timezone'
import Client from '../../utils/Client'
import Stat, {playerInfo} from '../../utils/Stat'
import Rank from '../../utils/Rank'

export default class RLRankCommand extends Command {
    constructor(client: Client, options: CommandOptions) {
        super(client, options)
    }

    async run(message: Message, args: Array<string>) {
        const requestInitiated = moment().unix()

        // Determine the type of user the requested rank is from
		const userType = (!(0 in args)) ?
        'self'
        :(!(1 in args) && message.mentions.members!.first()) ?
            'mention'
            :(1 in args) ?
                'other'
                :null
        
        const playerInfo: playerInfo = {
            platform: null,
            id: null,
            self: false
        }

		switch (userType) {
			case 'self': {
				// If user is checking their own rank
				const user = (await this.client.query('SELECT * FROM `users` WHERE `id`="'+message.author.id+'"'))?.getFirst()
				if (user.main === null) return this.client.error('notLinked', message).send()

				playerInfo.platform = user.main
				playerInfo.id = user[user.main]
				playerInfo.self = true
				break
			}
			case 'mention': {
				// If user is checking someone's rank by @mentioning them
				const user = (await this.client.query('SELECT * FROM `users` WHERE `id`="'+message.mentions.members!.first()!.user.id+'"'))?.getFirst()
				if (user.main === null) return this.client.error('notLinkedOther', message).send()
				
				playerInfo.platform = user.main
				playerInfo.id = user[user.main]
				break
			}
			case 'other': {
				// If user is checking someones rank from their platform and ID
				if (['epic', 'steam', 'xbox', 'ps', 'switch'].indexOf(args[0].toLowerCase()) === -1) return this.client.error('invalidPlatform', message).send()

				playerInfo.platform = args[0].toLowerCase()
				playerInfo.id = args[1]
				break
			}
			default: return this.client.error('noPlayerSpecified', message).send()
		}

        // Send initial message to edit with response once received
		const loading = message.client.guilds.cache.find(g => g.id === this.client.config.mainServer)!.emojis.cache.find(e => e.name === 'd_loading')!
        message.channel.send(`${loading} Getting rank...`).then(async (msg: Message) => {
            const player = await Stat.build(playerInfo)

            // Send error if player not found or request is timed out
			if (player === null) return msg.edit(' ', (requestInitiated+20 > moment().unix()) ?
                this.client.error('profileNotFound', message).createEmbed()
                :this.client.error('requestTimeout', message).createEmbed()
            )

            // Create Embed to fill with player data
			const Embed = new MessageEmbed()
                .setColor(this.client.config.color)
                .setFooter(`ORLA - Requested by ${message.author.tag}`, this.client.config.logo)
                .setTitle(`RL Stats: ${player.user.name}`)
                .setURL(player.user.statsURL)
			
			if (player.user.avatarURL) Embed.setThumbnail(player.user.avatarURL)
            
			const d_up = this.client.guilds.cache.find(g => g.id === this.client.config.mainServer)!.emojis.cache.find(e => e.name === 'd_up')!
			const d_down = this.client.guilds.cache.find(g => g.id === this.client.config.mainServer)!.emojis.cache.find(e => e.name === 'd_down')!

			Object.values(player.modes).forEach(mode => {
				const rank = new Rank(this.client, mode)
				
				const rankText = (['Supersonic Legend', 'Unranked'].indexOf(mode.rank) !== -1) ? `${rank.emote} (${rank.mmr})` : `${rank.emote} Div ${rank.division.name} (${rank.mmr})`
				const position = (!mode.position.overall) ?
					''
					: ((mode.position.overall >= 1000) ?
						`*(Top ${Math.floor((100 - mode.position.percentile)*10)/10}%)*`
						: `*(#${mode.position.overall})*`)
				const mmr = (rank.name === 'Supersonic Legend') ?
					(rank.division.deltaDown === undefined) ?
						''
						:`${d_down} ${rank.division.deltaDown}`
					:((mode.rank === 'Unranked') || (rank.division.deltaDown === undefined) || (rank.division.deltaUp === undefined)) ?
						''
						:`${d_up} ${rank.division.deltaUp} ${d_down} ${rank.division.deltaDown}`
				const streak = (mode.streak > 0) ? `🔥 ${mode.streak}` : `❄️ ${Math.abs(mode.streak)}`
				const games = (mode.name === 'Casual') ? '' : `🕐 ${mode.games} - ${streak}`

				Embed.addField(`__${mode.name}__ ${position}`, `${rankText}\n${mmr}\n${games}`, true)
			})

			// Add fields to evenly display ranks
			let blankFields = 0
			while ((Object.keys(player.modes).length + blankFields) % 3 !== 0) {
				Embed.addField("‎", "‎", true) // Contains invisible characters to make blank fields
				blankFields++
			}
			
			// Edit message to include player data
			msg.edit(' ', Embed)

			// Set role for rank if checking own rank
			if (playerInfo.self) {
				const ranks = JSON.parse((await this.client.query('SELECT `rankroles` FROM `servers` WHERE `id`="'+message.guild!.id+'"'))?.getFirst())
				message.member!.roles.remove(ranks).then(() => message.member!.roles.add(ranks[player.highestRank().value-1]))
			}
		})
    }
}
import Command, {CommandOptions} from '../../utils/Command'
import {Message, MessageEmbed} from 'discord.js';
import moment from 'moment-timezone'
import Client from '../../utils/Client'
import Stat, {playerInfo} from '../../utils/Stat'

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
            
            // Define rank codes and emoji names for later
			const rankCodes = ['Unranked','BronzeI','BronzeII','BronzeIII','SilverI','SilverII','SilverIII','GoldI','GoldII','GoldIII','PlatinumI','PlatinumII','PlatinumIII','DiamondI','DiamondII','DiamondIII','ChampionI','ChampionII','ChampionIII','GrandChampionI','GrandChampionII','GrandChampionIII','SupersonicLegend']
			const rankEmojis = ['00_unranked','01_bronze1','02_bronze2','03_bronze3','04_silver1','05_silver2','06_silver3','07_gold1','08_gold2','09_gold3','10_plat1','11_plat2','12_plat3','13_diamond1','14_diamond2','15_diamond3','16_champion1','17_champion2','18_champion3','19_grandchampion1','20_grandchampion2','21_grandchampion3','22_supersoniclegend']
			const d_up = this.client.guilds.cache.find(g => g.id === this.client.config.mainServer)!.emojis.cache.find(e => e.name === 'd_up')!
			const d_down = this.client.guilds.cache.find(g => g.id === this.client.config.mainServer)!.emojis.cache.find(e => e.name === 'd_down')!
			
			Object.values(player.modes).forEach(mode => {
				const emote = message.client.guilds.cache.find(g => g.id === this.client.config.mainServer)!.emojis.cache.find(e => e.name === rankEmojis[rankCodes.indexOf(mode.rank.replace(/ /g, ''))])
				
				const position = (!mode.overall) ? '' : ((mode.overall >= 1000) ? `*(Top ${Math.floor((100 - mode.percentile)*10)/10}%)*` : `*(#${mode.overall})*`)

				const rank = (['Supersonic Legend', 'Unranked'].indexOf(mode.rank) !== -1) ? `${emote} (${mode.mmr})` : `${emote} Div ${mode.division} (${mode.mmr})`

				const mmr = (mode.rank === 'Supersonic Legend') ?
					(mode.down === undefined) ?
						''
						:`${d_down} ${mode.down}`
					:((mode.rank === 'Unranked') || (mode.down === undefined) || (mode.up === undefined)) ?
						''
						:`${d_up} ${mode.up} ${d_down} ${mode.down}`

				const streak = (mode.streak > 0) ? `🔥 ${mode.streak}` : `❄️ ${String(mode.streak).replace('-','')}`
				const games = (mode.name === 'Casual') ? '' : `🕐 ${mode.games} - ${streak}`

				Embed.addField(`__${mode.name}__ ${position}`, `${rank}\n${mmr}\n${games}`, true)
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
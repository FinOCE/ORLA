import Command, {CommandOptions} from '../../utils/Command'
import {Message, MessageEmbed} from 'discord.js';
import Client from '../../utils/Client'
import User from '../../utils/User'

export default class ExitCommand extends Command {
    constructor(client: Client, options: CommandOptions) {
        super(client, options)
    }

    run(message: Message, args: Array<string>) {
        const page = (0 in args && !isNaN(Number(args[0])) && Number(args[0]) > 0) ? Number(args[0])-1 : 0

		const loading = message.client.guilds.cache.find(g => g.id === this.client.config.mainServer)!.emojis.cache.find(e => e.name === 'd_loading')
		message.channel.send(`${loading} Getting leaderboard...`).then(async msg => {
			const users = (await this.client.query('SELECT * FROM `users`'))?.getAll()
			users.sort((a: Record<string, any>, b: Record<string, any>) => {return b.xp - a.xp})

			const Embed = new MessageEmbed()
				.setColor(this.client.config.color)
				.setTitle(`XP Leaderboard`)
				.setFooter(`ORLA - Requested by ${message.author.tag}`, this.client.config.logo)
			
			let list = ''

			let range = (users.length - page * 10 < 10) ? users.length - page * 10 : 10
			for (let i = 0; i < range; i++) {
				const user = await User.build(this.client, users[page*10+i].id)
				list += `**#${page * 10 + i + 1}** <@${user.id}> - Level **${user.orla.xp.level}** (**${user.orla.xp.total}**)\n`
			}

			Embed.setDescription(`Page **${page + 1}** of **${Math.ceil(users.length/10)}**\n\n${list}`)

			msg.edit(' ', Embed)
		})
    }
}
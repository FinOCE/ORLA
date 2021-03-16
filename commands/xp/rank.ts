import Command, {CommandOptions} from '../../utils/Command'
import {Message, MessageEmbed} from 'discord.js';
import Client from '../../utils/Client'

export default class RankCommand extends Command {
    constructor(client: Client, options: CommandOptions) {
        super(client, options)
    }

    async run(message: Message, args: Array<string>) {
        const member = (message.mentions.members!.first()) ? message.mentions.members!.first()! : message.member!
		const nickname = (member.nickname) ? member.nickname : member.user.username

		const user = await (require('../../utils/User').default).build(message.client, member.user.id)

		const Embed = new MessageEmbed()
			.setColor(this.client.config.color)
			.setTitle(`${nickname} is level ${user.orla.xp.level}`)
			.setThumbnail(user.discord.avatarURL)
			.setFooter(`ORLA - Requested by ${message.author.tag}`, this.client.config.logo)
		
		const c_blue = this.client.guilds.cache.find(g => g.id === this.client.config.mainServer)!.emojis.cache.find(e => e.name === 'c_blue')
		const c_white = this.client.guilds.cache.find(g => g.id === this.client.config.mainServer)!.emojis.cache.find(e => e.name === 'c_white')

		let bar = ''
        for (let i = 0; i < Math.round((user.orla.xp.progress.remaining/user.orla.xp.progress.cost)*10); i++) {
            bar += `${c_blue}`
        }
        for (let i = 0; i < 10-Math.round((user.orla.xp.progress.remaining/user.orla.xp.progress.cost)*10); i++) {
            bar += `${c_white}`
        }

		const position = (await this.client.query('SELECT * FROM `users` WHERE `xp`>'+user.orla.xp.total))?.getAll().length+1

		Embed.setDescription(`${bar}\nTotal: **${user.orla.xp.total}** - **${user.orla.xp.progress.remaining}**/**${user.orla.xp.progress.cost}**\nPosition: **#${position}**`)

		message.channel.send(Embed)
    }
}
import Command, {CommandOptions} from '../../utils/Command'
import {Message, MessageEmbed} from 'discord.js';
import Client from '../../utils/Client'

export default class RLSetupCommand extends Command {
    constructor(client: Client, options: CommandOptions) {
        super(client, options)
    }

    async run(message: Message, args: Array<string>) {
        if (!(0 in args)) return this.client.error('invalidSyntax', message).send()
		if (['steam', 'ps', 'xbox', 'epic', 'switch'].indexOf(args[0].toLowerCase()) === -1) return this.client.error('invalidPlatform', message).send()
		if (!(1 in args)) return this.client.error('noPlayerSpecified', message).send()

		await this.client.query('UPDATE `users` SET `main`="'+args[0].toLowerCase()+'",`'+args[0].toLowerCase()+'`="'+encodeURI(args[1])+'" WHERE `id`="'+message.author.id+'"')

		const response = 'Your account has been linked to your profile. The account details you set are as follows:\n\n'
						+`Platform: \`${args[0].toLowerCase()}\`\n`
						+`Account: \`${args[1]}\`\n\n`
						+`You can now type \`${this.client.config.prefix}rlrank\` to check your rank, if the details provided point to a valid account.`

		const Embed = new MessageEmbed()
			.setColor(this.client.config.color)
			.setFooter(`ORLA - Requested by ${message.author.tag}`, this.client.config.logo)
			.setTitle('Account Successfully Linked')
			.setDescription(response)
		
		message.channel.send(Embed)
    }
}
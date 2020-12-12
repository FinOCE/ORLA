module.exports = {
	desc: 'used to setup the bot',
	syntax: '',
	async run(message, args) {
        const Discord = require('discord.js')

        const server = await message.client.query('SELECT * FROM `servers` WHERE `id`="'+message.guild.id+'"')
        if (!(0 in server.getAll())) {
            await message.client.query('INSERT INTO `servers` (`id`) VALUES ("'+message.guild.id+'")')
        }

        if (!(0 in args)) {
            const Embed = new Discord.MessageEmbed()
                .setColor(message.client.config.color)
                .setTitle('Server Setup')
                .setDescription(
                    `**${message.client.config.prefix}setup pingrole [roleID]:** Set role to ping for announcements/notifications\n`
                    +`**${message.client.config.prefix}setup timezone [timezone]:** Set timezone for bot functions\n`
                    +`*NOTE: Timezones must follow format \`Country/Capital\` e.g. \`Australia/Sydney\`*\n`
                    +`**${message.client.config.prefix}setup joinleave [channelID]:** Set channel to send join/leave messages\n`
                    +`**${message.client.config.prefix}setup announcements [channelID]:** Send event announcement messages\n`
                    +`**${message.client.config.prefix}setup notifications [channelID]:** Send event notification messages\n`
                    +`**${message.client.config.prefix}setup upcoming [channelID]:** Create an upcoming event list\n`
                    +`**${message.client.config.prefix}setup remove [function]:** Remove one of the above functions from the server\n`
                    +`**${message.client.config.prefix}setup autorole add [roleID]:** Automatically give role when user joins\n`
                    +`**${message.client.config.prefix}setup autorole remove [roleID]:** Remove role from list of autoroles\n`
                )

            message.channel.send(Embed)
        } else {
            if (!(1 in args)) {
                message.client.error('invalidSyntax', message)
                return
            }

            if (args[0] === 'remove') {
                if (['announcements', 'notifcations', 'upcoming', 'autorole', 'joinleave', 'pingrole'].indexOf(args[1].toLowerCase()) !== -1) {
                    await message.client.query('UPDATE `servers` SET `'+args[1]+'`=null WHERE `id`="'+message.guild.id+'"')
                } else {
                    message.client.error('invalidSyntax', message)
                }
            }
            if (args[0] === 'pingrole') {
                if (/\d{18}/.test(args[1])) {
                    await message.client.query('UPDATE `servers` SET `pingrole`="'+args[1]+'" WHERE `id`="'+message.guild.id+'"')
                } else {
                    message.client.error('invalidSyntax', message)
                }
            }
            if (args[0] === 'timezone') {
                if (/[a-zA-Z]+\/[a-zA-Z]+/.test(args[1])) {
                    await message.client.query('UPDATE `servers` SET `pingrole`="'+args[1]+'" WHERE `id`="'+message.guild.id+'"')
                } else {
                    message.client.error('invalidSyntax', message)
                }
            }
            if (args[0] === 'joinleave') {
                if (/\d{18}/.test(args[1])) {
                    await message.client.query('UPDATE `servers` SET `joinleave`="'+args[1]+'" WHERE `id`="'+message.guild.id+'"')
                } else {
                    message.client.error('invalidSyntax', message)
                }
            }
            if (args[0] === 'announcements') {
                if (/\d{18}/.test(args[1])) {
                    await message.client.query('UPDATE `servers` SET `announcements`="'+args[1]+'" WHERE `id`="'+message.guild.id+'"')
                } else {
                    message.client.error('invalidSyntax', message)
                }
            }
            if (args[0] === 'notifications') {
                if (/\d{18}/.test(args[1])) {
                    await message.client.query('UPDATE `servers` SET `notifications`="'+args[1]+'" WHERE `id`="'+message.guild.id+'"')
                } else {
                    message.client.error('invalidSyntax', message)
                }
            }
            if (args[0] === 'autorole') {
                if (!(2 in args)) {
                    message.client.error('invalidSyntax', message)
                    return
                }
                if (args[1] === 'add') {
                    if (/\d{18}/.test(args[2])) {
                        const autoroles = await message.client.query('SELECT `autorole` FROM `servers` WHERE `id`="'+message.guild.id+'"')
                        let autorole = JSON.parse(autoroles.getFirst())
                        if (autorole === null) autorole = []
                        autorole.push(args[2])
                        await message.client.query('UPDATE `servers` SET `autorole`=\''+JSON.stringify(autorole)+'\' WHERE `id`="'+message.guild.id+'"')
                    } else {
                        message.client.error('invalidSyntax', message)
                    }
                }
                if (args[1] === 'remove') {
                    if (/\d{18}/.test(args[2])) {
                        const autoroles = await message.client.query('SELECT `autorole` FROM `servers` WHERE `id`="'+message.guild.id+'"')
                        const autorole = JSON.parse(autoroles.getFirst())
                        autorole.shift(args[2])
                        await message.client.query('UPDATE `servers` SET `autorole`=\''+JSON.stringify(autorole)+'\' WHERE `id`="'+message.guild.id+'"')
                    } else {
                        message.client.error('invalidSyntax', message)
                    }
                }
            }
        }
    }
}
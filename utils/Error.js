module.exports.Error = class Error {
    constructor(method, message) {
        // List all error methods and their responses
        const prefix = message.client.config.prefix

        const methods = {
            // general
            "invalidPermission" : {
                "title": "Invalid Permission",
                "description": "Sorry, but you don't have permission to use that command."
            },
            "invalidSyntax": {
                "title": "Invalid Syntax",
                "description": `To check the correct syntax, please type \`${prefix}help [command]\``
            },
            "notMainServer": {
                "title": "Command not Available",
                "description": "Sorry, but that command is not available on this server."
            },

            // rlrank and rlsetup
            "notLinked": {
                "title": "Account Not Linked",
                "description": `To link your account, please use the command \`${prefix}rlsetup [platform (pc/xbox/ps)] [account]\``
            },
            "notLinkedOther": {
                "title": "Account Not Linked",
                "description": `Unfortunately that player has not yet linked their account. You can check their stats if you have their platform and account name/ID by using \`${prefix}rlrank [platform] [account]\``
            },
            "invalidPlatform": {
                "title": "Invalid Platform",
                "description": "The platform you specified was not a valid option. The valid options are `steam`, `epic`, `xbox`, and `ps`"
            },
            "noPlayerSpecified": {
                "title": "No Player Specified",
                "description": "To use this command, you need to specify the platform and account."
            },
            "profileNotFound": {
                "title": "Profile Not Found",
                "description": "The profile you searched for could not be found. Please try again."
            },
            "requestTimeout": {
                "title": "Request Timeout",
                "description": "The server took too long to respond. Unfortunately we can't receive your account stats right now."
            }
        }

        this.error = methods[method]
        this.message = message
    }
    send() {
        const Discord = require('discord.js')

        // Build MessageEmbed
        const Embed = new Discord.MessageEmbed()
            .setColor(this.message.client.config.color)
            .setFooter(`ORLA - Requested by ${this.message.author.tag}`, this.message.client.config.logo)
            .setTitle('Error: ' + this.error.title)
            .setDescription(this.error.description)

        // Send error message
        this.message.channel.send(Embed)
    }
    createEmbed() {
        const Discord = require('discord.js')

        // Build MessageEmbed
        const Embed = new Discord.MessageEmbed()
            .setColor(this.message.client.config.color)
            .setFooter(`ORLA - Requested by ${this.message.author.tag}`, this.message.client.config.logo)
            .setTitle('Error: ' + this.error.title)
            .setDescription(this.error.description)
        
        return Embed
    }
}
const Command = require('../Command.js');
const {MessageEmbed, MessageAttachment} = require('discord.js');
const {fail, load} = require('../../utils/emojis.json');

module.exports = class frameCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'frame',

            usage: 'frame <user mention/id>',
            description: 'Generates a frame image',
            type: client.types.FUN,
            examples: ['frame @split'],
        });
    }

    async run(message, args) {
        const member = (await this.getGuildMember(message.guild, args.join(' '))) || message.author;
        await message.channel
            .send({
                embeds: [new MessageEmbed().setDescription(`${load} Loading...`)],
            }).then(msg => {
                message.loadingMessage = msg;
                this.handle(member, message, false);
            });
    }

    async interact(interaction) {
        await interaction.deferReply();
        const member = interaction.options.getUser('user') || interaction.author;
        this.handle(member, interaction, true);
    }

    async handle(targetUser, context, isInteraction) {
        try {
            const buffer = await context.client.ameApi.generate('frame', {
                url: this.getAvatarURL(targetUser, 'png'),
            });
            const attachment = new MessageAttachment(buffer, 'frame.png');

            if (isInteraction) {
                context.editReply({
                    files: [attachment],
                });
            }
            else {
                context.loadingMessage ? context.loadingMessage.edit({
                    files: [attachment],
                    embeds: []
                }) : context.channel.send({
                    files: [attachment],
                });
            }
        }
        catch (err) {
            const embed = new MessageEmbed()
                .setTitle('Error')
                .setDescription(fail + ' ' + err.message)
                .setColor('RED');
            if (isInteraction) {
                context.editReply({
                    embeds: [embed],
                });
            }
            else {
                context.loadingMessage ? context.loadingMessage.edit({
                    embeds: [embed]
                }) : context.channel.send({
                    embeds: [embed]
                });
            }
        }

    }
};

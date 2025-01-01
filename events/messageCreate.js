const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        // Discord davet linkini tespit etmek için regex
        const invitePattern = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[a-zA-Z0-9]{2,}/;

        if (invitePattern.test(message.content)) {
            // Mesajı silin
            await message.delete();

            // Log mesajı
            const logChannel = message.guild.channels.cache.get(message.client.logChannel);
            if (logChannel) {
                const embed = new MessageEmbed()
                    .setTitle('Discord Davet Linki Silindi')
                    .setDescription(`${message.author.tag} tarafından gönderilen bir davet linki silindi.`)
                    .addField('Mesaj', message.content)
                    .setTimestamp();

                logChannel.send({ embeds: [embed] });
            }
        }
    },
};

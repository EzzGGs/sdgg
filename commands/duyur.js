const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duyur')
        .setDescription('Sunucudaki herkese DM ile duyuru gönderir.')
        .addStringOption(option => 
            option.setName('mesaj')
                .setDescription('Duyurulacak mesajı girin.')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        // Admin yetki kontrolü
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply('Bu komutu kullanma yetkiniz yok.');
        }

        const announcement = interaction.options.getString('mesaj');
        if (!announcement) return interaction.reply('Lütfen duyurulacak mesajı girin.');

        const members = interaction.guild.members.cache; // Sunucudaki tüm üyeleri alır
        let successful = 0;
        let failed = 0;

        for (const member of members.values()) {
            member.send({ 
                embeds: [ 
                    new MessageEmbed()
                        .setTitle('Duyuru')
                        .setColor(0x00ff00)
                        .setDescription(announcement)
                        .setFooter({ text: `Gönderen: ${interaction.user.tag}` }) // Obje ile footer
                ] 
            }).then(() => successful++) // DM gönderimi başarılı olursa successful artırır
            .catch(() => failed++); // DM gönderimi başarısız olursa failed artırır
        }

        const embed = new MessageEmbed()
            .setTitle('Duyuru Başarılı!')
            .setColor(0x00ff00)
            .setDescription(`${successful} üyeye duyuru gönderildi.`)
            .addField('Başarısız Gönderimler', failed.toString(), true); // Boş değil, geçerli değerler kullanılır

        await interaction.reply({ embeds: [embed] });
    },
};

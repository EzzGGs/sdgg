const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

let autoTagSettings = {
    tag: '',
    position: 'baş', // 'baş' or 'son'
    enabled: false
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ototag')
        .setDescription('Yeni üyelere otomatik takma ad ekler.')
        .addStringOption(option =>
            option.setName('yazi')
                .setDescription('Eklenecek yazıyı girin')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('yer')
                .setDescription('Yazının nereye ekleneceğini seçin ("baş" veya "son")')
                .setChoices(
                    { name: 'Baş', value: 'baş' },
                    { name: 'Son', value: 'son' }
                )
                .setRequired(false))
        .addStringOption(option =>
            option.setName('durum')
                .setDescription('Ototag sistemini aç veya kapat')
                .setChoices(
                    { name: 'Açık', value: 'açık' },
                    { name: 'Kapalı', value: 'kapalı' }
                )
                .setRequired(false)),

    async execute(interaction) {
        // Yalnızca yöneticilerin kullanabilmesi için izin kontrolü
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmanız gerekiyor.', ephemeral: true });
        }

        const tag = interaction.options.getString('yazi');
        const position = interaction.options.getString('yer');
        const status = interaction.options.getString('durum');

        if (status) {
            if (status === 'açık') {
                if (!autoTagSettings.tag) {
                    return interaction.reply({ content: 'Ototag açılmadan önce bir yazı ayarlayın.', ephemeral: true });
                }
                autoTagSettings.enabled = true;
                return interaction.reply({ content: 'Ototag sistemi açıldı.', ephemeral: true });
            } else if (status === 'kapalı') {
                autoTagSettings.enabled = false;
                return interaction.reply({ content: 'Ototag sistemi kapatıldı.', ephemeral: true });
            }
        }

        if (tag) {
            autoTagSettings.tag = tag;
        }

        if (position) {
            autoTagSettings.position = position;
        }

        await interaction.reply({ content: `Ototag ayarlandı:
Yazı: ${autoTagSettings.tag}
Yer: ${autoTagSettings.position}
Durum: ${autoTagSettings.enabled ? 'Açık' : 'Kapalı'}`, ephemeral: true });
    },

    async handleGuildMemberAdd(member) {
        if (!autoTagSettings.enabled || !autoTagSettings.tag) return;

        const newNickname = autoTagSettings.position === 'baş'
            ? `${autoTagSettings.tag} ${member.user.username}`
            : `${member.user.username} ${autoTagSettings.tag}`;

        try {
            await member.setNickname(newNickname);
        } catch (error) {
            console.error('Takma ad ayarlanırken bir hata oluştu:', error);
        }
    }
};

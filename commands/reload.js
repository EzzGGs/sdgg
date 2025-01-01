const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Botu yeniden başlatır. (Sadece yöneticiler)'),

    async execute(interaction) {
        // Yalnızca yöneticilerin bu komutu kullanabilmesi için yetki kontrolü
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }

        await interaction.reply({ content: 'Bot yeniden başlatılıyor...', ephemeral: true });

        // Botu yeniden başlatma işlemi (özellikle pm2 veya nodemon kullanıyorsanız)
        process.exit();
    },
};

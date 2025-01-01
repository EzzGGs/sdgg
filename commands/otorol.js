const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('otorol')
        .setDescription('Sunucuya giren herkese belirtilen rolü verir.')
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Otorol olarak atanacak rol')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Yönetici yetkisi kontrolü
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için gerekli yetkiniz yok.', ephemeral: true });
        }

        const role = interaction.options.getRole('rol');

        if (!role) {
            return interaction.reply({ content: 'Lütfen geçerli bir rol seçin.', ephemeral: true });
        }

        await interaction.reply({ content: `${role.name} rolü, sunucuya giren tüm kullanıcılara verilecek.`, ephemeral: true });

        const { guild } = interaction;

        // Sunucuya giren üyeleri belirlemek için 'guildMemberAdd' event dinlenir
        guild.members.cache.filter(member => !member.roles.cache.has(role.id)).forEach(member => {
            member.roles.add(role.id).catch(error => {
                console.error(`Rol verilemedi: ${error}`);
            });
        });

        // Bot bu olayları dinlemeye devam eder ve yeni kullanıcılar için kontrol sağlar
        guild.client.on('guildMemberAdd', async member => {
            if (!member.roles.cache.has(role.id)) {
                try {
                    await member.roles.add(role.id);
                } catch (error) {
                    console.error(`Yeni üyelere rol verilemedi: ${error}`);
                }
            }
        });
    },
};

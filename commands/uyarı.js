const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uyarı')
        .setDescription('Bir kullanıcıya uyarı rolü verir.')
        .addUserOption(option => 
            option.setName('kullanıcı')
                .setDescription('Uyarı rolü vermek istediğiniz kullanıcıyı seçin')
                .setRequired(true)),

    async execute(interaction) {
        // Yalnızca yöneticilerin bu komutu kullanabilmesi için yetki kontrolü
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }

        const user = interaction.options.getUser('kullanıcı');
        const member = interaction.guild.members.cache.get(user.id);
        const roles = interaction.guild.roles.cache;
        const uyarı1Rol = roles.find(role => role.name === 'Uyarı 1');
        const uyarı2Rol = roles.find(role => role.name === 'Uyarı 2');
        const uyarı3Rol = roles.find(role => role.name === 'Uyarı 3');

        if (!uyarı1Rol || !uyarı2Rol || !uyarı3Rol) {
            return interaction.reply('Gerekli uyarı rolleri bulunamadı. Lütfen "Uyarı 1", "Uyarı 2" ve "Uyarı 3" rolleri oluşturulduğundan emin olun.');
        }

        try {
            if (member.roles.cache.has(uyarı3Rol.id)) {
                return interaction.reply(`${member.user.tag} zaten "Uyarı 3"e sahip.`);
            }

            if (member.roles.cache.has(uyarı2Rol.id)) {
                await member.roles.remove(uyarı2Rol);
                await member.roles.add(uyarı3Rol);
                return interaction.reply(`${member.user.tag} "Uyarı 3" verildi.`);
            }

            if (member.roles.cache.has(uyarı1Rol.id)) {
                await member.roles.remove(uyarı1Rol);
                await member.roles.add(uyarı2Rol);
                return interaction.reply(`${member.user.tag} "Uyarı 2"ye verildi`);
            }

            await member.roles.add(uyarı1Rol);
            return interaction.reply(`${member.user.tag} "Uyarı 1" verildi.`);
        } catch (error) {
            console.error('Rol eklenirken hata oluştu:', error);
            return interaction.reply('Uyarı Verilirken bir hata oluştu.');
        }
    },
};

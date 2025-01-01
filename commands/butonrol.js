const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('butonrol')
        .setDescription('Belirli bir mesaja buton ekleyerek, tıklayan kullanıcılara rol verir.')
        .addStringOption(option => 
            option.setName('mesaj')
                .setDescription('Butonun ekleneceği mesaj')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Butona tıklayan kullanıcılara verilecek rol')
                .setRequired(true)),

    async execute(interaction) {
        // Yalnızca yöneticilerin kullanabilmesi için izin kontrolü
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yönetici olmanız gerekiyor.', ephemeral: true });
        }

        const mesaj = interaction.options.getString('mesaj');
        const rol = interaction.options.getRole('rol');

        const embed = new MessageEmbed()
            .setDescription(mesaj)
            .setColor('BLUE');

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('rolVer')
                    .setLabel('Rol Al')
                    .setStyle('PRIMARY'),
            );

        await interaction.reply({ content: 'Mesaj oluşturuldu!', ephemeral: true });

        const message = await interaction.channel.send({ embeds: [embed], components: [row] });

        // Etkileşim toplayıcı (interaction collector)
        const filter = i => i.customId === 'rolVer';
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'rolVer') {
                await i.member.roles.add(rol);
                await i.reply({ content: `Rol başarıyla verildi: ${rol.name}`, ephemeral: true });
            }
        });

        collector.on('end', collected => {
            console.log(`Toplam ${collected.size} etkileşim toplandı.`);
        });
    },
};

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voice')
        .setDescription('Ses kanalını yönetmek için komutlar')
        .addSubcommand(subcommand =>
            subcommand
                .setName('lock')
                .setDescription('Ses kanalını kilitle'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unlock')
                .setDescription('Ses kanalını aç'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban')
                .setDescription('Bir kullanıcıyı ses kanalından banlar')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('Banlanacak kullanıcı')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unban')
                .setDescription('Bir kullanıcının ses kanalına erişimini açar')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('Banı açılacak kullanıcı')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('limit')
                .setDescription('Ses kanalının kullanıcı limitini ayarla')
                .addIntegerOption(option =>
                    option
                        .setName('number')
                        .setDescription('Kullanıcı limiti')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rename')
                .setDescription('Ses kanalının adını değiştir')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Yeni kanal adı')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('claim')
                .setDescription('Kanalın sahibi yoksa sahipliği al'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('yardım')
                .setDescription('Ses kanalını yönetmek için komut listesini göster')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.member.voice.channel;

        if (subcommand === 'yardım') {
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Voice Komutları')
                .setDescription('Ses kanalınızı yönetmek için aşağıdaki komutları kullanabilirsiniz:')
                .addFields(
                    { name: '/voice lock', value: 'Ses kanalını kilitler.' },
                    { name: '/voice unlock', value: 'Ses kanalını açar.' },
                    { name: '/voice ban @kullanıcı', value: 'Bir kullanıcıyı ses kanalından banlar.' },
                    { name: '/voice unban @kullanıcı', value: 'Bir kullanıcının banını kaldırır.' },
                    { name: '/voice limit <kişi sayısı>', value: 'Ses kanalına katılabilecek kişi sayısını ayarlar.' },
                    { name: '/voice rename <yeni isim>', value: 'Ses kanalının adını değiştirir.' },
                    { name: '/voice claim', value: 'Kanalın sahibi yoksa sahipliği alır.' }
                );

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!channel) {
            return interaction.reply({
                content: 'Ses kanalında olmanız gerekiyor!',
                ephemeral: true,
            });
        }

        if (subcommand !== 'claim' && !channel.name.includes(interaction.user.username)) {
            return interaction.reply({
                content: 'Bu komutu yalnızca kendi özel ses kanalınızda kullanabilirsiniz!',
                ephemeral: true,
            });
        }

        switch (subcommand) {
            case 'lock':
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    CONNECT: false,
                });
                await interaction.reply('Ses kanalı kilitlendi.');
                break;
            case 'unlock':
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    CONNECT: true,
                });
                await interaction.reply('Ses kanalı açıldı.');
                break;
            case 'ban': {
                const user = interaction.options.getUser('user');
                await channel.permissionOverwrites.edit(user.id, {
                    CONNECT: false,
                });
                await interaction.reply(`${user.username} ses kanalından banlandı.`);
                break;
            }
            case 'unban': {
                const user = interaction.options.getUser('user');
                await channel.permissionOverwrites.delete(user.id);
                await interaction.reply(`${user.username} ses kanalına erişimi açıldı.`);
                break;
            }
            case 'limit': {
                const limit = interaction.options.getInteger('number');
                if (limit < 0 || limit > 99) {
                    return interaction.reply({
                        content: 'Kullanıcı limiti 0 ile 99 arasında bir değer olmalıdır.',
                        ephemeral: true,
                    });
                }
                await channel.edit({ userLimit: limit });
                await interaction.reply(`Ses kanalının kullanıcı limiti ${limit} olarak ayarlandı.`);
                break;
            }
            case 'rename': {
                const newName = interaction.options.getString('name');
                await channel.edit({ name: newName });
                await interaction.reply(`Ses kanalının adı başarıyla "${newName}" olarak değiştirildi.`);
                break;
            }
            case 'claim': {
                const owner = channel.members.find(member => channel.name.includes(member.user.username));
                if (owner) {
                    return interaction.reply({
                        content: 'Bu kanalın zaten bir sahibi var.',
                        ephemeral: true,
                    });
                }

                const newName = `${interaction.user.username}'ın Odası`;
                await channel.edit({
                    name: newName,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ['CONNECT'],
                        },
                        {
                            id: interaction.user.id,
                            allow: ['CONNECT', 'MANAGE_CHANNELS'],
                        },
                    ],
                });

                await interaction.reply(`Kanalın yeni sahibi oldunuz ve kanal adı "${newName}" olarak değiştirildi.`);

                // Metin kanalını bul ve komut listesini gönder
                const textChannel = interaction.guild.channels.cache.find(
                    ch =>
                        ch.name === `${interaction.user.username.toLowerCase()}-text` &&
                        ch.type === 'GUILD_TEXT'
                );

                if (textChannel) {
                    try {
                        await this.sendCommandList(textChannel);
                    } catch (error) {
                        console.error('Mesaj gönderilemedi:', error);
                    }
                } else {
                    console.error('Metin kanalı bulunamadı veya adı hatalı.');
                }

                break;
            }
        }
    },
    async sendCommandList(channel) {
        const commandList = `
Özel Oda Komutları:
- **/voice lock**: Ses kanalını kilitler.
- **/voice unlock**: Ses kanalını açar.
- **/voice ban @kullanıcı**: Bir kullanıcıyı ses kanalından banlar.
- **/voice unban @kullanıcı**: Bir kullanıcının banını kaldırır.
- **/voice limit <kişi sayısı>**: Ses kanalına katılabilecek kişi sayısını ayarlar.
- **/voice rename <yeni isim>**: Ses kanalının adını değiştirir.
- **/voice claim**: Kanalın sahibi yoksa sahipliği alır.
        `;
        try {
            await channel.send(commandList);
        } catch (error) {
            console.error('Komut listesi gönderilemedi:', error);
        }
    },
};

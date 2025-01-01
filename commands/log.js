const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Log kanalı belirler.')
        .addChannelOption(option => 
            option.setName('kanal')
                .setDescription('Logların gönderileceği kanal')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply('Bu komutu kullanma yetkiniz yok.');
        }

        const logChannel = interaction.options.getChannel('kanal');
        if (!logChannel) return interaction.reply('Lütfen geçerli bir log kanalı seçin.');

        interaction.client.logChannel = logChannel.id;
        interaction.reply(`Log kanalı başarıyla ${logChannel} olarak ayarlandı!`);

        const client = interaction.client;

        client.on('guildMemberUpdate', (oldMember, newMember) => {
            if (oldMember.nickname !== newMember.nickname) {
                const embed = new MessageEmbed()
                    .setTitle('İsim Değişikliği')
                    .setDescription(`${oldMember.user.tag} isim değişikliği yaptı.`)
                    .addField('Eski İsim', oldMember.nickname || oldMember.user.username, true)
                    .addField('Yeni İsim', newMember.nickname || newMember.user.username, true)
                    .setTimestamp();

                client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
            }

            // Rol ekleme ve kaldırma loglama
            oldMember.roles.cache.forEach(role => {
                if (!newMember.roles.cache.has(role.id)) {
                    const embed = new MessageEmbed()
                        .setTitle('Rol Kaldırıldı')
                        .setDescription(`${newMember.user.tag} kullanıcısından ${role.name} rolü kaldırıldı.`)
                        .setTimestamp();

                    client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
                }
            });

            newMember.roles.cache.forEach(role => {
                if (!oldMember.roles.cache.has(role.id)) {
                    const embed = new MessageEmbed()
                        .setTitle('Rol Eklendi')
                        .setDescription(`${newMember.user.tag} kullanıcısına ${role.name} rolü eklendi.`)
                        .setTimestamp();

                    client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
                }
            });
        });

        client.on('roleCreate', role => {
            const embed = new MessageEmbed()
                .setTitle('Rol Oluşturuldu')
                .setDescription(`Yeni bir rol oluşturuldu: ${role.name}`)
                .setTimestamp();

            client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
        });

        client.on('roleDelete', role => {
            const embed = new MessageEmbed()
                .setTitle('Rol Silindi')
                .setDescription(`Bir rol silindi: ${role.name}`)
                .setTimestamp();

            client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
        });

        client.on('channelCreate', channel => {
            const embed = new MessageEmbed()
                .setTitle('Kanal Oluşturuldu')
                .setDescription(`Yeni bir kanal oluşturuldu: ${channel.name}`)
                .setTimestamp();

            client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
        });

        client.on('channelDelete', channel => {
            const embed = new MessageEmbed()
                .setTitle('Kanal Silindi')
                .setDescription(`Bir kanal silindi: ${channel.name}`)
                .setTimestamp();

            client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
        });

        client.on('channelUpdate', (oldChannel, newChannel) => {
            if (oldChannel.name !== newChannel.name) {
                const embed = new MessageEmbed()
                    .setTitle('Kanal Güncellendi')
                    .setDescription(`Bir kanal güncellendi.\n**Eski İsim:** ${oldChannel.name}\n**Yeni İsim:** ${newChannel.name}`)
                    .setTimestamp();

                client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
            }
        });

        client.on('emojiCreate', emoji => {
            const embed = new MessageEmbed()
                .setTitle('Emoji Eklendi')
                .setDescription(`Yeni bir emoji eklendi: ${emoji.name}`)
                .setTimestamp();

            client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
        });

        client.on('emojiDelete', emoji => {
            const embed = new MessageEmbed()
                .setTitle('Emoji Silindi')
                .setDescription(`Bir emoji silindi: ${emoji.name}`)
                .setTimestamp();

            client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
        });

        client.on('guildUpdate', (oldGuild, newGuild) => {
            if (oldGuild.name !== newGuild.name) {
                const embed = new MessageEmbed()
                    .setTitle('Sunucu Güncellendi')
                    .setDescription(`Sunucu adı güncellendi.\n**Eski İsim:** ${oldGuild.name}\n**Yeni İsim:** ${newGuild.name}`)
                    .setTimestamp();

                client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
            }
        });

        client.on('guildMemberAdd', member => {
            const embed = new MessageEmbed()
                .setTitle('Kullanıcı Katıldı')
                .setDescription(`${member.user.tag} sunucuya katıldı.`)
                .setTimestamp();

            client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
        });

        client.on('guildMemberRemove', member => {
            const embed = new MessageEmbed()
                .setTitle('Kullanıcı Ayrıldı')
                .setDescription(`${member.user.tag} sunucudan ayrıldı.`)
                .setTimestamp();

            client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
        });

        client.on('messageDelete', message => {
            if (message.partial) return;
            const embed = new MessageEmbed()
                .setTitle('Mesaj Silindi')
                .setDescription(`Bir mesaj silindi.\n**Yazan:** ${message.author.tag}\n**Kanal:** ${message.channel}\n**Mesaj:** ${message.content}`)
                .setTimestamp();

            client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
        });

        client.on('messageUpdate', (oldMessage, newMessage) => {
            if (oldMessage.partial || newMessage.partial) return;
            if (oldMessage.content === newMessage.content) return;

            const embed = new MessageEmbed()
                .setTitle('Mesaj Düzenlendi')
                .setDescription(`Bir mesaj düzenlendi.\n**Yazan:** ${oldMessage.author.tag}\n**Kanal:** ${oldMessage.channel}`)
                .addField('Eski Mesaj', oldMessage.content, true)
                .addField('Yeni Mesaj', newMessage.content, true)
                .setTimestamp();

            client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
        });

        client.on('interactionCreate', interaction => {
            if (interaction.isCommand()) {
                const embed = new MessageEmbed()
                    .setTitle('Komut Kullanıldı')
                    .setDescription(`Bir komut kullanıldı: ${interaction.commandName}\n**Kullanan:** ${interaction.user.tag}`)
                    .setTimestamp();

                client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
            }
        });

        client.on('messageReactionAdd', (reaction, user) => {
            const embed = new MessageEmbed()
                .setTitle('Tepki Eklendi')
                .setDescription(`${user.tag} tepki ekledi.\n**Mesaj:** ${reaction.message.content}\n**Tepki:** ${reaction.emoji.name}`)
                .setTimestamp();

            client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
        });

        client.on('messageReactionRemove', (reaction, user) => {
            const embed = new MessageEmbed()
                .setTitle('Tepki Kaldırıldı')
                .setDescription(`${user.tag} tepki kaldırdı.\n**Mesaj:** ${reaction.message.content}\n**Tepki:** ${reaction.emoji.name}`)
                .setTimestamp();

            client.channels.cache.get(client.logChannel).send({ embeds: [embed] });
        });
    },
};

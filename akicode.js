const { Client, Intents, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs');
const axios = require('axios');
const {
    token,
    clientId,
    guildId,
    logChannel: logChannelId,
    maintenanceMode,
    afkChannelId,
    prefix,
    serverStatusChannelId,
    apiUrl,
    imageOnlyChannelId // Sadece görsel kuralı uygulanacak kanal
} = require('./config.json');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});

// Komut koleksiyonları
client.commands = new Collection();
client.prefixCommands = new Collection();
const commands = [];

// Slash komutlarını yükleme
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }
    if (command.voiceStateUpdate) {
        client.prefixCommands.set(command.name, command);
    }
}

async function deployCommands() {
    const rest = new REST({ version: '9' }).setToken(token);
    try {
        console.log('Slash komutları yükleniyor...');
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log('Slash komutları başarıyla yüklendi!');
    } catch (error) {
        console.error('Slash komutları yüklenirken bir hata oluştu:', error);
    }
}

// Görsel dışı mesajları silme
async function enforceImageOnlyChannel() {
    if (!imageOnlyChannelId) {
        console.warn('Sadece görsel kanal ID\'si belirtilmedi. Atlanıyor.');
        return;
    }

    client.on('messageCreate', async (message) => {
        if (message.channel.id === imageOnlyChannelId && !message.attachments.size && !message.author.bot) {
            try {
                await message.delete();
                console.log(`Sadece görsel kuralı ihlal edildi. Mesaj silindi: ${message.content}`);
            } catch (error) {
                console.error('Mesaj silinirken hata oluştu:', error);
            }
        }
    });

    console.log(`Sadece görsel kuralı uygulanıyor. Kanal ID: ${imageOnlyChannelId}`);
}

// Minecraft sunucu durumunu kontrol eden ve güncelleyen fonksiyon
async function updateServerStatusMessage() {
    try {
        const channel = await client.channels.fetch(serverStatusChannelId);
        const messages = await channel.messages.fetch({ limit: 10 });
        const botMessage = messages.find(msg => msg.author.id === client.user.id);

        const response = await axios.get(apiUrl);
        const data = response.data;

        const onlinePlayers = data.players.online || 0;
        const maxPlayers = data.players.max || 'Bilinmiyor';
        const serverIP = data.host || 'Bilinmiyor';
        const serverStatus = data.online ? '🟢 Açık' : '🔴 Kapalı';
        const color = data.online ? '#2ecc71' : '#e74c3c';

        const embed = {
            color: color,
            title: 'Minecraft Sunucu Durumu',
            fields: [
                { name: 'Sunucu', value: `\`${serverIP}\``, inline: false },
                { name: 'Durum', value: serverStatus, inline: true },
                { name: 'Oyuncular', value: data.online ? `${onlinePlayers}/${maxPlayers}` : 'N/A', inline: true }
            ],
            thumbnail: { url: 'https://example.com/your-image.png' },
            footer: { text: 'Son Güncelleme', icon_url: 'https://example.com/your-image.png' },
            timestamp: new Date()
        };

        if (botMessage) {
            await botMessage.edit({ embeds: [embed] });
        } else {
            await channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Sunucu durumu güncellenirken hata oluştu:', error);
    }
}

// Bot hazır olduğunda çalışacak
client.once('ready', () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
    deployCommands();

    // Botun durumunu ayarla
    client.user.setActivity('EzzGGs', { type: 'WATCHING' });

    // Botu AFK kanalına bağlama
    const afkChannel = client.channels.cache.get(afkChannelId);
    if (afkChannel) {
        joinVoiceChannel({
            channelId: afkChannel.id,
            guildId: afkChannel.guild.id,
            adapterCreator: afkChannel.guild.voiceAdapterCreator,
        });
        console.log(`Bot AFK kanalına bağlandı: ${afkChannel.name}`);
    } else {
        console.warn('AFK kanalı bulunamadı.');
    }

    // Minecraft sunucu durumunu periyodik olarak güncelle
    setInterval(updateServerStatusMessage, 60000); // 1 dakika

    // Görsel kanalı kuralını başlat
    enforceImageOnlyChannel();
});

// Slash komutlarını işleme
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (maintenanceMode && !interaction.member.permissions.has('ADMINISTRATOR')) {
        return interaction.reply({ content: 'Bot bakım modunda. Şu anda komutları kullanamazsınız.', ephemeral: true });
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Bu komutu çalıştırırken bir hata oluştu.', ephemeral: true });
    }
});

// Prefix komutlarını işleme
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    if (maintenanceMode && !message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('Bot bakım modunda. Şu anda komutları kullanamazsınız.');
    }

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Bu komutu çalıştırırken bir hata oluştu!');
    }
});

// Ses kanalı güncellemelerini işleme
client.on('voiceStateUpdate', async (oldState, newState) => {
    for (const command of client.prefixCommands.values()) {
        if (typeof command.voiceStateUpdate === 'function') {
            await command.voiceStateUpdate(oldState, newState);
        }
    }
});

// Üye giriş-çıkış loglama
client.on('guildMemberAdd', async member => {
    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    logChannel.send({ content: `${member.user.tag} sunucuya katıldı!` });
});

client.on('guildMemberRemove', async member => {
    const logChannel = member.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    logChannel.send({ content: `${member.user.tag} sunucudan ayrıldı.` });
});

// Selamlaşma mesajları
client.on('messageCreate', async message => {
    if (message.author.bot || message.system) return;

    if (['sa', 'selam'].includes(message.content.toLowerCase())) {
        message.channel.send('AleykümSelam!');
    }
});

client.login(token);

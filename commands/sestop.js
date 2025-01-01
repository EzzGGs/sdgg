const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

const voiceDataPath = path.join(__dirname, 'voice_data.json');

// Ses verilerini yükle veya oluştur
let voiceData = {};
if (fs.existsSync(voiceDataPath)) {
    voiceData = JSON.parse(fs.readFileSync(voiceDataPath));
} else {
    fs.writeFileSync(voiceDataPath, JSON.stringify(voiceData, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sestop')
        .setDescription('En çok ses kanalında duran 10 kişiyi ve kendi sıralamanı gösterir.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Sunucuya ait ses verilerini kontrol et
        if (!voiceData[guildId]) {
            return interaction.reply({ content: 'Bu sunucuda henüz veri bulunmamaktadır.', ephemeral: true });
        }

        const guildVoiceData = voiceData[guildId];

        // Kullanıcıların toplam sürelerini sıralama için hazırlayın
        const sortedData = Object.entries(guildVoiceData)
            .sort(([, aTime], [, bTime]) => bTime - aTime);

        // En çok süreye sahip 10 kullanıcıyı al
        const topUsers = sortedData.slice(0, 10);

        // Kullanıcının sırasını belirle
        const userIndex = sortedData.findIndex(([id]) => id === userId);
        const userPosition = userIndex >= 0 ? userIndex + 1 : 'Sıralamada bulunmuyor';

        // Embed oluştur
        const embed = new MessageEmbed()
            .setColor('#00FF00')
            .setTitle('Ses Kanalı Sıralaması')
            .setDescription('En çok sesli kanalda vakit geçiren kullanıcılar ve sıralamanız.')
            .addFields(
                topUsers.map(([id, time], index) => ({
                    name: `#${index + 1} - ${interaction.guild.members.cache.get(id)?.user.tag || 'Bilinmeyen'}`,
                    value: `Süre: ${Math.floor(time / 60)} dakika`,
                    inline: false
                }))
            )
            .setFooter({ text: `Senin sıran: ${userPosition}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    trackVoiceState(oldState, newState) {
        if (!newState.guild) return;

        const guildId = newState.guild.id;
        const userId = newState.id;

        // Sadece ses kanalına katılma ve ayrılma durumlarını izle
        if (!oldState.channelId && newState.channelId) {
            // Kullanıcı bir kanala katıldı
            if (!voiceData[guildId]) voiceData[guildId] = {};
            if (!voiceData[guildId][userId]) voiceData[guildId][userId] = 0;

            voiceData[guildId][userId] = { joinTime: Date.now(), totalTime: voiceData[guildId][userId] || 0 };
        } else if (oldState.channelId && !newState.channelId) {
            // Kullanıcı bir kanaldan ayrıldı
            if (voiceData[guildId] && voiceData[guildId][userId]) {
                const sessionTime = Date.now() - voiceData[guildId][userId].joinTime;
                voiceData[guildId][userId] += sessionTime;
                delete voiceData[guildId][userId].joinTime;
            }
        }

        // Verileri dosyaya kaydet
        fs.writeFileSync(voiceDataPath, JSON.stringify(voiceData, null, 4));
    }
};

const { Permissions } = require('discord.js');

module.exports = {
    name: 'private-room',
    description: 'Ses kanallarında özel oda sistemi.',
    async voiceStateUpdate(oldState, newState) {
        const TRIGGER_CHANNEL_NAME = 'Giriş Kanalı';

        // Kullanıcı herhangi bir kanala girmemişse işlem yapma
        if (!newState.channel) return;

        // Kullanıcı "Giriş Kanalı"na girerse işlem başlat
        if (newState.channel.name === TRIGGER_CHANNEL_NAME) {
            const guild = newState.guild;
            const user = newState.member.user;

            // Özel oda kategorisini bulun veya oluşturun
            let kategori = guild.channels.cache.find(c => c.name === 'Özel Odalar' && c.type === 'GUILD_CATEGORY');
            if (!kategori) {
                kategori = await guild.channels.create('Özel Odalar', { type: 'GUILD_CATEGORY' });
            }

            // Özel ses kanalı oluşturma
            const kanal = await guild.channels.create(`${user.username}'ın Odası`, {
                type: 'GUILD_VOICE',
                parent: kategori.id,
                permissionOverwrites: [
                    {
                        id: guild.id, // Sunucudaki herkes
                        deny: [Permissions.FLAGS.CONNECT], // Bağlanmayı engelle
                    },
                    {
                        id: user.id, // Kanalı oluşturan kullanıcı
                        allow: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.MANAGE_CHANNELS], // Kanalı yönetme ve bağlanma izni
                    },
                ],
            });

            // Kullanıcıyı yeni oluşturulan kanala taşıma
            await newState.setChannel(kanal);

            console.log(`Kanal oluşturuldu ve ${user.username} taşındı: ${kanal.name}`);

            // Kanal boş kalırsa otomatik silme sistemi
            const interval = setInterval(async () => {
                if (kanal.members.size === 0) {
                    clearInterval(interval); // Döngüyü durdur
                    await kanal.delete(); // Kanalı sil
                    console.log(`Kanal silindi: ${kanal.name}`);
                }
            }, 60000); // 1 dakika kontrol aralığı
        }
    },
};

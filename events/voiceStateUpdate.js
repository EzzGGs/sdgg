client.on('voiceStateUpdate', async (oldState, newState) => {
    // Kullanıcı bir kanaldan ayrıldıysa
    if (oldState.channel) {
        const channel = oldState.channel;

        // Kanal özel oda kategorisinde mi?
        if (channel.parent && channel.parent.name === 'Özel Odalar') {
            // Kanalda kullanıcı yoksa
            if (channel.members.size === 0) {
                // 1 dakika bekle ve tekrar kontrol et
                setTimeout(async () => {
                    if (channel.members.size === 0) {
                        try {
                            await channel.delete();
                            console.log(`Boş kaldığı için silinen kanal: ${channel.name}`);
                        } catch (error) {
                            console.error(`Kanal silinirken hata oluştu: ${error}`);
                        }
                    }
                }, 5000); // 1 dakika bekleme süresi
            }
        }
    }
});

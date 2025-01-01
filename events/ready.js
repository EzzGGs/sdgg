module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`${client.user.tag} olarak giriş yapıldı!`);

        // Bot durumu ve oynuyor mesajı
        client.user.setPresence({
            activities: [{ name: 'EzzGGs', type: 'PLAYING' }],
            status: 'online'
        });
    },
};

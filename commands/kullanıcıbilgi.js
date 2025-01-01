const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kullanıcıbilgi')
        .setDescription('Bir kullanıcının bilgilerini gösterir.')
        .addUserOption(option => 
            option.setName('kullanıcı')
                .setDescription('Bilgilerini görmek istediğiniz kullanıcıyı seçin')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const güvenilirlikSeviyesi = calculateTrustLevel(member); // Güvenilirlik seviyesi hesaplama fonksiyonu

        const userInfoEmbed = new MessageEmbed()
            .setAuthor(user.username, user.displayAvatarURL())
            .setColor('RED')
            .setTitle(`${user.username} Bilgileri`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addField('ID:', `${user.id}`, true)
            .addField('Discord İsmi:', `${user.tag}`, true)
            .addField('Sunucuya Katılım Tarihi:', `${new Date(member.joinedTimestamp).toLocaleDateString()}`, true)
            .addField('Hesap Oluşturma Tarihi:', `${new Date(user.createdTimestamp).toLocaleDateString()}`, true)
            .addField('Durum:', `${user.presence ? user.presence.status : 'Çevrimdışı'}`, true)
            .addField('Güvenilirlik Seviyesi:', `${güvenilirlikSeviyesi}`, true)
            .setFooter(`${interaction.user.tag} tarafından istendi.`, interaction.user.displayAvatarURL())
            .setTimestamp();

        await interaction.reply({ embeds: [userInfoEmbed] });
    },
};

// Basit bir güvenilirlik seviyesi hesaplama fonksiyonu
function calculateTrustLevel(member) {
    // Bu basit örnek, kullanıcının güvenilirlik seviyesini sunucuya katılım süresine göre hesaplar
    const daysSinceJoin = (Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24);
    
    if (daysSinceJoin > 365) {
        return 'Yüksek';
    } else if (daysSinceJoin > 180) {
        return 'Orta';
    } else {
        return 'Düşük';
    }
}

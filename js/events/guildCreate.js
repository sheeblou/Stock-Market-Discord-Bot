module.exports = async (client, guild) => {
    try {
        let defChannel = "";
        Array.from(guild.channels.cache.values()).forEach((channel) => {
            if (channel.type === "text" && defChannel === "" && channel.permissionsFor(guild.me).has("SEND_MESSAGES") && channel.permissionsFor(guild.me).has("VIEW_CHANNEL")) {
                defChannel = channel;
                defChannel.send("Hey! To get started type `sm!help` !");
            }
        });
        client.user.setPresence({activity: {name: `${client.guilds.cache.size} servers! | sm!help`, type: "WATCHING", url: "https://www.twitch.tv/monstercat"}});
        console.log(`JOINED ${guild.id} - ${guild.name} - ${guild.memberCount} - (${client.users.cache.size})`)
    } catch (e) {
        console.log(e);
    }
}
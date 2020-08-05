const mysql = require("../util/mysql.js");

module.exports = async (client, guild) => {
    mysql.getPrefixServer(guild.id).then(r => {
        if (r[1]) {
            mysql.sql.query("DELETE FROM prefixserver WHERE id = ?", [guild.id], function(err) {if (err) throw err})
        }
    })
    client.user.setPresence({activity: {name: `${client.guilds.cache.size} servers! | sm!help`, type: "WATCHING", url: "https://www.twitch.tv/monstercat"}});
    console.log(`LEFT ${guild.id} - ${guild.name} - ${guild.memberCount} - (${client.users.cache.size})`);
}
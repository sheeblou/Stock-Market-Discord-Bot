const mysql = require("../util/mysql.js");

module.exports = async (client) => {
    console.log(`Logged ! ${client.user.tag}`);
    client.user.setPresence({activity: {name: `${client.guilds.cache.size} servers! | sm!help`, type: "WATCHING", url: "https://www.twitch.tv/monstercat"}});
    mysql.sql.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });
}
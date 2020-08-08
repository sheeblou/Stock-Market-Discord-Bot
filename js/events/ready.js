const mysql = require("../util/mysql.js");
const auth = require("../config.js");
const DBL = require("dblapi.js");

module.exports = async (client) => {
    console.log(`Logged ! ${client.user.tag}`);
    client.user.setPresence({activity: {name: `${client.guilds.cache.size} servers! | sm!help`, type: "WATCHING", url: "https://www.twitch.tv/monstercat"}});
    mysql.sql.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });
    if(process.env.npm_lifecycle_event !== "dev") {
        const dbl = new DBL(auth.topgg_token, client);
        setInterval(() =>{
            let size = client.guilds.cache.size || client.guilds.size;
            if(size) {
                dbl.postStats(size).then(() => console.log(`STAT POSTED WITH ${size}`)).catch((err) => console.log(`ERROR: STATS NOT POSTED ${err}`))
            }
        }, 60*1000*30)
    }
}
const Discord = require("discord.js");
const auth = require('../auth.json');
const cmd = require('./commands.js');
const util = require('./utils.js');
const coolDownSet = new Set();
const client = new Discord.Client();
client.login(auth.token);

client.on("ready", () => {
    console.log(`Logged ! ${client.user.tag}`);
    util.sql.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });
});

client.on("guildCreate", guild => {
    try {
        let defChannel = "";
        Array.from(guild.channels.cache.values()).forEach((channel) => {
            if (channel.type === "text" && defChannel === "" && channel.permissionsFor(guild.me).has("SEND_MESSAGES") && channel.permissionsFor(guild.me).has("VIEW_CHANNEL")) {
                defChannel = channel;
                defChannel.send("Hey! To get started type `sm!help` !");
                console.log(`JOINED ${guild.id} - ${guild.name}`)
            }
        });
    } catch (e) {
        console.log(e);
    }
});

client.on("guildDelete", guild => {
    util.getPrefixServer(guild.id).then(r => {
        if (r[1]) {
            util.sql.query("DELETE FROM prefixserver WHERE id = ?", [guild.id], function(err, result) {if (err) throw err})
        }
    })
    console.log(`LEFT ${guild.id} - ${guild.name}`);
});

client.on("message", msg => {
    let sMsg = msg.content.split(' ');
    msg.content = msg.content.toLowerCase();
    const commandsList = {
        // Basics
        "init": {func: cmd.initializeUser},
        "help": {func: cmd.showHelp},
        "prefix": {func: cmd.setPrefix, args: sMsg[1]},
        "ping": {func: cmd.showPing},
        "about": {func: cmd.showAbout, args: client.guilds.cache.size},

        // Trades manipulation
        "newtrade": {func: cmd.newTrade},
        "nt": {func: cmd.newTrade},
        "closetrade": {func: cmd.closeTrade},
        "ct": {func: cmd.closeTrade},
        "search": {func: cmd.searchMarket},
        "show": {func: cmd.showMarket},

        //Player info
        "balance": {func: cmd.showBalance},
        "list": {func: cmd.showList},
        "daily": {func: cmd.getDaily},

        //Admin commands
        //"money_edit": {func: cmd.moneyEdit}
        //"trade_edit": {func: cmd.tradeEdit}
        "send_mp": {func:cmd.sendMp, args: client}
    };

    if(msg.guild === null && msg.author.id !== client.user.id && !msg.content.startsWith("sm!")){
        console.log(`DM: ${msg.author.id} - ${msg.content}`);
    }

    let idServer = (msg.guild !== null) ? msg.guild.id : "-1";
    util.getPrefixServer(idServer).then(r => {
        r = (msg.guild !== null) ? r[0] : "sm!";
        if (msg.content.startsWith(r)) {
            try {
                console.log(`${msg.author.id} - ${msg.content}`);

                if (!commandsList[sMsg[0].split(r)[1]]) {
                    return
                }
                const {func, args} = commandsList[sMsg[0].split(r)[1]];
                const coolDownDelay = 0.1;
                util.sendMsg(msg, coolDownDelay, func, coolDownSet, args);
            } catch (e) {
                msg.channel.send("Something went terribly wrong! Please send the following text to Cryx#6546\n" +
                    "```\n" + e + "\n```");
                console.log(e);
            }
        }

        if (msg.content.split(" ")[0] === `<@!${client.user.id}>`) {
            msg.channel.send(`My prefix is **${r}**`)
        }
    });
});
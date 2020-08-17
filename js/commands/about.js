const mysql = require("../util/mysql.js");
const tool = require("../util/tools.js");

exports.run = async (client, msg, args) => {
    let msgBot = await msg.channel.send(tool.createEmbedMessage(msg, "FF8400", "Fetching data..."))

    mysql.sql.query("SELECT SUM(money), COUNT(*) FROM userdata WHERE money<1000000000000",
        function(err, result){
            if (err) throw err
            let totalMoney = tool.setRightNumFormat(result[0]['SUM(money)'], false);
            let totalMembers = tool.setRightNumFormat(result[0]['COUNT(*)'], false);
            let arr = [
                {
                    name: `Stats:`,
                    value: `- Working with **${totalMembers}** traders, owning **$${totalMoney}** in their balance!\n- Doing my business on **${tool.setRightNumFormat(client.guilds.cache.size, false)}** servers!`
                },
                {
                    name: `Need support?`,
                    value: `https://discord.gg/K3tUKAV or send a pm to the bot!`
                },
                {
                    name: `Source code:`,
                    value: `https://github.com/cryx3001/Stock-Market-Discord-Bot`
                },
                {
                    name: `Donate!`,
                    value: "**BTC :** `3CsrqouBbDToyoZH4XCq3yjs5DoCPMG3Ba`\n**ETH :** `0x8ACba400cACFb79977c607aAEFDf71De35405076`"
                }
            ];
            msgBot.edit(tool.createEmbedMessage(msg, "008CFF", "About the bot", arr));
        }
    );
}

exports.config = {
    name: "About",
    category: "Basics",
    usage: "about",
    aliases: ["ab"],
    description: "Give informations about the bot.",
};

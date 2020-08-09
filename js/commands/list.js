const mysql = require("../util/mysql.js");
const tool = require("../util/tools.js");

exports.run = async (client, msg, args) => {
    let displayName = (msg.guild !== null) ? (await msg.guild.members.fetch(tool.getUserId(msg, msg.content))).displayName : msg.author.username;
    let userid = (displayName === msg.author.username) ? msg.author.id : tool.getUserId(msg, msg.content);

    if (await mysql.isAccountCreated(userid, true, msg)) {
        let list = await mysql.getTradeList(msg, userid);
        let embedList = [];

        if (list.length <= 0) {
            msg.channel.send((userid !== msg.author.id) ? `${displayName} doesn't own any share!` : "You don't own any share!")

        } else {
            let tradeInfo = await mysql.getTradeInfo(list, msg);
            let sumProfit = tradeInfo[2];
            for (const elem of tradeInfo[0]) {
                let updateStream = "/ **Unknown**";
                if(elem.update){
                    if (elem.update === "streaming") {
                        updateStream = "/ **Instantaneous**";
                    } else if (elem.update.startsWith("delayed_streaming")) {
                        updateStream = `/ **Delayed by ${parseInt(elem.update.split("delayed_streaming_")[1]) / 60} minutes**`
                    }
                }
                let arr = {
                    name: `${elem.status.toUpperCase()} - ${elem.name} - ${elem.symbol.toUpperCase()} (ID: ${elem.id})`,
                    value: `__Status__: ${(elem.session === "market") ? "**Market open**" : "**Market closed**"} ${updateStream}\n__Change__: **${tool.setRightNumFormat(elem.profitPercentage)}%**\n__By share__: Paid: **$${tool.setRightNumFormat(elem.haspaid / elem.volume)}**, Now: **$${tool.setRightNumFormat(elem.shownWorthTrade / elem.volume)}** (Profit: **$${(tool.setRightNumFormat((elem.profit / elem.volume)))}**)\n__Your trade__: Paid: **$${tool.setRightNumFormat(elem.haspaid)}**, Now: **$${tool.setRightNumFormat(elem.shownWorthTrade)}** (Profit: **$${tool.setRightNumFormat(elem.profit)}**)\n`
                };
                embedList.push(arr);
            }
            msg.channel.send(tool.createEmbedMessage(msg, "008CFF", `Trades of ${displayName}`, embedList, `__Total profit:__ **$${tool.setRightNumFormat(sumProfit)}**`));
        }
    }
}

exports.config = {
    name: "List",
    category: "Player Account",
    usage: "list",
    aliases: ["lt"],
    description: "Your / user's current trades",
    syntax: "/ list @User",
}
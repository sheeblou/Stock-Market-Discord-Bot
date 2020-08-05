const mysql = require("../util/mysql.js");
const tool = require("../util/tools.js");

exports.run = async (client, msg, args) => {
    let displayName = msg.guild !== null ? (await msg.guild.members.fetch(tool.getUserId(msg, msg.content))).displayName : msg.author.username;
    let userid = displayName === msg.author.username ? msg.author.id : tool.getUserId(msg, msg.content);
    if (await mysql.isAccountCreated(userid, true, msg)) {
        let userMoney = await mysql.getUserData(userid, "money");
        userMoney = userMoney[0]["money"];
        let arr = [{
            name: `Balance of ${displayName}:`,
            value: `**$${tool.setRightNumFormat(userMoney)}**`
        }];
        let list = await mysql.getTradeList(msg);
        if (list.length > 0) {
            let sumProfit = await mysql.getTradeInfo(list, msg);
            let symb = sumProfit[2] > 0 ? "+" : "";
            arr.push({
                name: `Net worth with current trades (profit / loss)`,
                value: `**$${tool.setRightNumFormat(sumProfit[1] + userMoney)}** (**${symb}$${tool.setRightNumFormat(sumProfit[2])}**)`
            })
        }
        msg.channel.send(tool.createEmbedMessage(msg, "008CFF", "Balance", arr));
    }
}

exports.config = {
    name: "Balance",
    category: "Player Account",
    description: "To admire your / user's wealth",
    usage: "balance",
    aliases: ["bal"],
    syntax: "/ balance @User",
};
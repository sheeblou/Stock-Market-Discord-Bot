const mysql = require("../util/mysql.js");
const tool = require("../util/tools.js");
const smarket = require("../util/stockmarket.js");

exports.run = async (client, msg, args) => {
    let msgBot = await msg.channel.send(tool.createEmbedMessage(msg, "FF8400", "Creating trade..."));

    if (await mysql.isAccountCreated(msg.author.id, true, msg, msgBot)) {
        let splited = args.split(" ");
        let status = splited[0];
        let symb = splited[1];
        let amount = splited[2];
        let resp = await smarket.getStockData([symb])
        let list = await mysql.getTradeList(msg, msg.author.id);
        switch (status) {
            case "s":
                status = "sell";
                break;
            case "b":
                status = "buy";
                break;
        }

        if (resp[0].status === 0 || resp[0] === undefined || resp[0].price === undefined) {
            msgBot.edit(tool.createEmbedMessage(msg, "FF0000", "Unknown market! Please search one with sm!search"));

        } else if ((status !== "buy" && status !== "sell") || isNaN(amount) || amount === "" || amount < 0) {
            msgBot.edit(tool.createEmbedMessage(msg, "FF0000","Syntax error! Please try again. sm!newtrade <buy/sell> <symbol> <amount>"));

        } else {
            let money = await mysql.getUserData(msg.author.id, "money");
            let limitedAmount = 10000;
            let edited;
            if (amount > limitedAmount) {
                if(resp[0].update) {
                    if (resp[0].update.startsWith("delayed_streaming")) {
                        amount = limitedAmount;
                        edited = "delayed";
                    }
                } else if (await mysql.isMarketLimited(resp[0].symbol) || await mysql.isMarketLimited(resp[0].symbol_pro)) {
                    amount = limitedAmount;
                    edited = "limited"
                }
            }
            money = money[0]["money"];
            if (money - amount >= 0) {
                if (list.length >= 15) {
                    msgBot.edit(tool.createEmbedMessage(msg, "FF0000", "Payment refused!",
                        [{
                            name: `List full!`,
                            value: `You have too many shares! (Max:15)`
                        }]));
                } else {
                    let vol = amount / resp[0].price;
                    let usedSymb = symb.toUpperCase() === resp[0].symbol_pro ? resp[0].symbol_pro : resp[0].symbol;
                    await mysql.updateList(msg, "add", [usedSymb, status, vol, amount]);

                    mysql.sql.query("UPDATE userdata SET money = ? WHERE id = ?", [money - amount, msg.author.id], function (err) {
                        if (err) throw err
                    });
                    msgBot.edit(tool.createEmbedMessage(msg, "56C114", "Payment accepted!",
                        [{
                            name: `${resp[0].name} - ${symb.toUpperCase()}`,
                            value: `You now own **${vol}** shares from this stock! (Type: ${status.toUpperCase()})`
                        }]));
                    if (edited === "limited" || edited === "delayed") {
                        msgBot.edit(tool.createEmbedMessage(msg, "FF0000", `Warning, you are using a ${edited} market. Only $10K has been deducted from your balance.`));
                    }
                }
            } else {
                msgBot.edit(tool.createEmbedMessage(msg, "FF0000", "Payment refused!",
                    [{
                        name: `${resp[0].name} - ${symb.toUpperCase()}`,
                        value: `You don't have enough money!`
                    }]));
            }
        }
    }
}

exports.config = {
    name: "New trade",
    category: "Stock Market",
    usage: "newtrade",
    aliases: ["nt"],
    description: "To trade stocks on the market (ex: sm!newtrade buy AAPL 5000)\n" +
        "==>buy if you think the stock will go up,\n" +
        "==>sell if you think the stock will go down.",
    syntax: "<buy/sell> <symbol> <price>\nnewtrade <b/s> <symbol> <price>",
}
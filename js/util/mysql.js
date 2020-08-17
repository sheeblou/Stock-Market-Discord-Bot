const smarket = require('./stockmarket.js')
const auth = require('../config.js');
const tool = require("./tools.js");

const sql = require('mysql').createConnection({
    host: auth.db_host,
    database: auth.db_name,
    user: auth.db_user,
    password: auth.db_pass
});

async function updateMoney(msg, userID, num, isAdding = true) {
    let money = await getUserData(userID, "money");
    money = Math.max(0, isAdding == true ? money[0]["money"] + num : num);
    sql.query("UPDATE userdata SET money = ? WHERE id = ?", [money, userID], function(err){if (err) throw err});
}


async function updateList(msg, status, edit = []) {
    let list = await getTradeList(msg);

    if (status === "del") {
        list = list.filter(elem => !edit.includes(elem.id));
    } else if (status === "add") {
        let i = 0;
        for (i; list.find(elem => elem.id === i); i++) {
        }
        let elemToAdd = {
            id: i,
            symbol: edit[0],
            status: edit[1],
            volume: edit[2],
            haspaid: edit[3],
        };

        list.push(elemToAdd);
    }

    list = {trades: list};
    sql.query("UPDATE userdata SET trades = ? WHERE id = ?", [JSON.stringify(list), msg.author.id], function(err){if (err) throw err});
}


async function getTradeList(msg, userId = msg.author.id, value = null) {
    let list = await getUserData(userId, "trades");
    list = list[0]["trades"];
    list = JSON.parse(list).trades;
    return (Number.isInteger(value)) ? list.find(elem => elem.id === value) : list;
}


async function isAccountCreated(userId, autoMessage = false, msg, msgBot = null) {
    return new Promise(((resolve, reject) => {
        sql.query("SELECT id FROM userdata WHERE id = ?", [userId],
            function(err, result){
                if (err) reject(err);

                let isCreated = (result[0] !== undefined);
                if (!isCreated && autoMessage) {
                    let errMsg = (userId === msg.author.id) ? `You don't have any account! Please create one with the command: init` : "This member doesn't have any account!"
                    if(!msgBot) {
                        msg.channel.send(tool.createEmbedMessage(msg, "FF0000", errMsg));
                    }
                    else{
                        msgBot.edit(tool.createEmbedMessage(msg, "FF0000", errMsg));
                    }
                }
                return resolve(isCreated);
            }
        );
    }))
}


async function isMarketLimited(symb) {
    return new Promise(((resolve, reject) => {
        sql.query("SELECT markets FROM limited_markets WHERE markets = ?", [symb.toUpperCase()],
            function(err, result){
                if (err) reject(err);
                return resolve(result[0] !== undefined);
            }
        );
    }))
}


async function setPrefixServer(serverId, prefix) {
    let r = await getPrefixServer(serverId)
    if (!r[1]) {
        sql.query("INSERT INTO prefixserver VALUES(?,?)", [serverId, prefix], function(err){if (err) throw err});
    } else {
        sql.query("UPDATE prefixserver SET prefix = ? WHERE id = ?", [prefix, serverId], function(err){if (err) throw err});
    }
}


function getPrefixServer(serverId) {
    return new Promise((resolve, reject) => {
        if(serverId === "-1") resolve(["sm!", false]);

        sql.query("SELECT prefix FROM prefixserver WHERE id = ?", [serverId],
            function (err, result) {
                if (err) {
                    reject(err)
                    throw err
                }
                if (result[0] !== undefined) {
                    resolve([result[0]["prefix"], true]);
                }
                resolve(["sm!", false]);
            }
        );
    });
}


function getUserData(userId, value = ["*"]) {
    return new Promise((resolve, reject) => {
        sql.query(`SELECT ${value} FROM userdata WHERE id = ?`, [userId],
            function (err, result) {
                if (err){
                    reject(err);
                    throw err;
                }
                resolve(result);
            }
        );
    })
}


async function getTradeInfo(list, msg) {
    let arrSymb = [];
    let arrTrade = [];

    if(list[0] == undefined){
        return["-1"]
    }

    for (const elem of list) {
        arrSymb.push(elem.symbol)
    }
    let resp = await smarket.getStockData(arrSymb);
    try {
        list.forEach(elem => {
            let market = resp.find(e => elem.symbol.toUpperCase() === e.symbol || elem.symbol.toUpperCase().split(":")[1] === e.symbol)
            if(!market){
                msg.channel.send(`Something went terribly wrong while fetching the data of **${elem.symbol}** (ID: **${elem.id}**)! Please try again or contact the support`)
            }
            else{
                let isValid = market.price !== undefined && !isNaN(market.price);
                arrTrade.push(
                    {
                        id: elem.id,
                        name: isValid ?  market.name : "REQUEST FAILED, RETRY LATER",
                        symbol: isValid ?  elem.symbol : "API ERROR",
                        volume: elem.volume,
                        status: elem.status,
                        haspaid: parseFloat(elem.haspaid),
                        price: market.price,
                        session: market.session,
                        update: market.update
                    }
                )
            }
        });
    } catch (e) {
        msg.channel.send("Something went terribly wrong! Please try later.\n```\n" + e + "\n```");
        console.error(e);
    }

    let arrResult = [];
    let sumTrades = 0;
    let sumProfit = 0
    for (let m of arrTrade) {
        let worthTrade = m.price * m.volume;
        let profit = worthTrade - m.haspaid;
        let shownWorthTrade = worthTrade;

        if (m.status === "sell") {
            profit *= -1;
            worthTrade = profit + m.haspaid;
        }
        sumTrades += (worthTrade !== undefined && !isNaN(worthTrade)) ? worthTrade : 0;
        sumProfit += (profit !== undefined && !isNaN(profit)) ? profit : 0;

        let percentage = (profit / m.haspaid) * 100;

        arrResult.push(
            {
                name: m.name,
                symbol: m.symbol,
                status: m.status,
                id: m.id,
                volume: m.volume,
                haspaid: m.haspaid,
                worthTrade: worthTrade,
                profit: profit,
                profitPercentage: percentage,
                shownWorthTrade: shownWorthTrade,
                session: m.session,
                update: m.update
            }
        )
    }
    return [arrResult, sumTrades, sumProfit];
}

module.exports = {
    getUserData: getUserData,
    isAccountCreated: isAccountCreated,
    getTradeList: getTradeList,
    updateList: updateList,
    getTradeInfo: getTradeInfo,
    updateMoney: updateMoney,
    getPrefixServer: getPrefixServer,
    setPrefixServer: setPrefixServer,
    isMarketLimited : isMarketLimited,
    sql : sql,
};
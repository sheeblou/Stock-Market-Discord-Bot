const util = require("./utils.js");
const ownerID = "165127283470893056";


//init
async function initializeUser(msg) {
    let accCreated = await util.isAccountCreated(msg.author.id, false, msg);
    if (accCreated) {
        msg.channel.send("You have already initialized your account!");
    } else {
        util.sql.query("INSERT INTO userdata VALUES(?,?,?,?)", [msg.author.id, 100000, '{"trades" : []}', 0],
        function(err, result) {
                if (err) throw err;
                msg.channel.send("Your account has been created!");
                showHelp(msg);
            }
        );
    }
}

//del
async function deleteUser(msg){
    let accCreated = await util.isAccountCreated(msg.author.id, false, msg);
    if (accCreated) {
        util.sql.query("DELETE FROM userdata WHERE id = ?", [msg.author.id],
            function(err) {
                if (err) throw err;
                msg.channel.send("Your account has been deleted! You can recreate one with **init**");
            }
        );
    }
    else{
        msg.channel.send("Huh, I didn't find your account.");
    }
}

//balance
async function showBalance(msg) {
    let displayName = msg.guild !== null ? (await msg.guild.members.fetch(util.getUserId(msg, msg.content))).displayName : msg.author.username;
    let userid = displayName === msg.author.username ? msg.author.id : util.getUserId(msg, msg.content);
    if (await util.isAccountCreated(userid, true, msg)) {
        let userMoney = await util.getUserData(userid, "money");
        userMoney = userMoney[0]["money"];
        let arr = [{
            name: `Balance of ${displayName}:`,
            value: `**$${util.setRightNumFormat(userMoney)}**`
        }];
        let list = await util.getTradeList(msg);
        if (list.length > 0) {
            let sumProfit = await util.getTradeInfo(list, msg);
            let symb = sumProfit[2] > 0 ? "+" : "";
            arr.push({
                name: `Net worth with current trades (profit / loss)`,
                value: `**$${util.setRightNumFormat(sumProfit[1] + userMoney)}** (**${symb}$${util.setRightNumFormat(sumProfit[2])}**)`
            })
        }

        msg.channel.send(util.createEmbedMessage(msg, "008CFF", "Balance", arr));
    }
}

//help
function showHelp(msg) {
    msg.channel.send(util.createEmbedMessage(msg, "008CFF", "Help!",
        [
            {
                name: "*Basics*",
                value: "`help` You're here \n`init` The command to get started \n`del` Delete your account from the database (__Warning: Your account will be instantly wiped out from the database without any confirmation!__)\n`prefix <prefix>` Change my prefix to the choosen one! \n*Note: Mention me with `prefix` to know my prefix! (@Stock Market prefix)*\n`ping` To see the latency between you, the bot and the API\n`about` About the bot\n"
            },
            {
                name: "*Player account*",
                value: "`balance` / `balance @User` To admire your / user's wealth\n`list` / `list @User` Your / user's current trades\n`daily` To get your daily reward\n\n"
            },
            {
                name: "*Stock Market* ",
                value: "`search` To search for stock markets\n`show <symbol>` To get details about a particular market (ex: *sm!show AAPL*)\n`newtrade <buy/sell> <symbol> <price>` To trade stocks on the market(ex: *sm!newtrade buy AAPL 5000*)\n==>`buy` if you think the stock will go up, \n==>`sell` if you think the stock will go down.\n`closetrade <ID>` (ex: *sm!closetrade 0*) Close a trade (the ID can be found with the `list` command). Give to you the final value of your trade."
            },
            {
                name: "*Okay, how do I play?* ",
                value: "First, you are going to look for a market. Type `sm!search`, it will redirect you to a website.\nThen type `sm!show <symbol>` if you want more details about it.\nNow it's time to trade! Follow the instructions above for `newtrade` and `closetrade`!\n***The symbol is not the name, but may look like this: TSLA, AAPL, MSFT... ***\nHappy trading!"
            },
            {
                name: "*Available aliases*",
                value: "`buy` = `b`\n`sell` = `s`\n`newtrade` = `nt`\n`closetrade` = `ct`\n"
            }
        ]
    ));
}

//prefix
function setPrefix(msg, arg) {
    if (arg === undefined || arg.length > 5 || arg.length < 1) {
        msg.channel.send("Your prefix is invalid! (Should be between 1 to 5 characters)");
        return;
    } else if (msg.guild === null) {
        msg.channel.send("Sorry, you can't do that here.");
        return;
    }

    let permsAuthor = msg.channel.permissionsFor(msg.author.id);
    if (permsAuthor.has("ADMINISTRATOR") || permsAuthor.has("MANAGE_GUILD")) {
        if(arg !== "sm!"){
            try{
                //Escape is deprecated, I beg you, don't use it
                util.setPrefixServer(msg.guild.id, decodeURIComponent(escape(arg)));
            }
            catch (e) {
                msg.channel.send("The prefix asked is not in the right format! (Please use the latin alphabet)");
                return;
            }
        }
        else{
            util.sql.query("DELETE FROM prefixserver WHERE id = ?", [msg.guild.id], function(err){if (err) throw err})
        }
        msg.channel.send(`My prefix is now **${arg}**`);
    } else {
        msg.channel.send("You don't have enough permissions! (You need to have `ADMINISTRATOR` or `MANAGE_GUILD` permission on the server)");
    }
}

//search
async function searchMarket(msg) {
    // let tag = msg.content.split('sm!search ')[1];
    //
    // let response = await fmp.search(tag, 10);
    // if(response === undefined || response.length <= 0){
    //     text = "Nothing was found, try to shorten the symbol or the name (as removing 'USD' from it if present) and try again.";
    //     msg.channel.send(text);
    // }
    // else{
    //     let arrText = [];
    //     let arrSymb = []
    //
    //     for (const r of response) {arrSymb.push(r.symbol)}
    //
    //     let resp = util.getStockData(arrSymb)
    //     for(const market of resp){
    //         let text = {
    //             name : `${market.name} (${market.symbol})`,
    //             value : `Price: **$${market.price}**  (Change: **${market.changesPercentage}%** | **$${market.change}**)\n \n`
    //         };
    //         arrText.push(text);
    //
    //     }
    //     msg.channel.send(util.createEmbedMessage(msg, "008CFF", "Results", arrText));
    // }
    msg.channel.send("Regular markets: https://www.tradingview.com/screener/ \nCryptocurrencies: https://www.tradingview.com/crypto-screener/ \nFOREX: https://www.tradingview.com/forex-screener/")
}

//show
async function showMarket(msg) {
    let tag = msg.content.split(' ')[1];
    let resp = await util.getStockData([tag])

    // let timer = new Promise(function(resolve) {
    //     setTimeout(resolve, 5000);
    // });

    // Promise.race([timer, util.getChart(tag.toUpperCase(), 192, msg)]).then(() =>{
    try {
        resp = resp[0];
        let status = (resp.session === "market") ? "open" : "closed";
        let update = "Unknown";
        if(resp.update === "streaming") {
            update = "Instantaneous";
        }
        else if(resp.update.startsWith("delayed_streaming")){
            update = `Delayed by ${parseInt(resp.update.split("delayed_streaming_")[1]) / 60} minutes`
        }
        let field = {
            name: `Informations for ${resp.name} (${resp.symbol}): `,
            value: `__Price__: **$${util.setRightNumFormat(resp.price)}** (Change: **${resp.changesPercentage}%** => **$${util.setRightNumFormat(resp.change)}**)\n__Status__: Currently ${status}\n__Update__: ${update}`
        }
        let defaultDescription = `Chart available [here](https://tradingview.com/chart/?symbol=${resp.symbol}).`

        msg.channel.send(util.createEmbedMessage(msg, "008CFF", "Details", [field], description = defaultDescription))
        //
        // ).then(() => {
        //     util.autoDelete(msg, `img/${pathImg}`, checkImg);
        // }).catch(err => {
        //     msg.channel.send(util.createEmbedMessage(msg, "008CFF", "Details", [field], description = defaultDescription))
        //     util.autoDelete(msg, `img/${pathImg}`, checkImg);
        //     console.log(err);
        // })
    } catch (e) {
        msg.channel.send("Nothing was found. Please try again with an another symbol.");
    }
    // }).catch(err => console.log(err));
}


//daily
async function getDaily(msg) {
    if (await util.isAccountCreated(msg.author.id, true, msg)) {
        let data = await util.getUserData(msg.author.id, ["dailytime", "money"]);
        let dailyTime = data[0]["dailytime"];
        let money = data[0]["money"];

        let dateNow = Math.round(Date.now() / 1000);
        let delay = parseInt(dailyTime) - dateNow;

        if (delay < 0) {
            let newBalance = money + 2500;
            let newDailyTime = dateNow + 86400;

            util.sql.query("UPDATE userdata SET money = ?, dailytime = ? WHERE id = ?", [newBalance, newDailyTime, msg.author.id], function(err, result){if (err) throw err});
            msg.channel.send(util.createEmbedMessage(msg, "56C114", "Your daily reward!", [{
                name: `You have received your daily reward!`,
                value: `Thank you for your fidelity, you have received $2,500!`
            }
            ]));
        } else {
            let h = "0" + parseInt(delay / 3600);
            let m = "0" + parseInt(delay % 3600 / 60);
            let s = "0" + parseInt(delay % 60);

            msg.channel.send(util.createEmbedMessage(msg, "FF0000", "Your daily reward!",
                [{
                    name: `Be patient !`,
                    value: `Please wait **${h.toString().substr(-2)}h${m.toString().substr(-2)}m${s.toString().substr(-2)}s** and try again.`
                }]));
        }
    }
}

//list
async function showList(msg) {
    let displayName = (msg.guild !== null) ? (await msg.guild.members.fetch(util.getUserId(msg, msg.content))).displayName : msg.author.username;
    let userid = (displayName === msg.author.username) ? msg.author.id : util.getUserId(msg, msg.content);

    if (await util.isAccountCreated(userid, true, msg)) {
        let list = await util.getTradeList(msg, userid);
        let embedList = [];

        if (list.length <= 0) {
            msg.channel.send((userid !== msg.author.id) ? `${displayName} doesn't own any share!` : "You don't own any share!")

        } else {
            let tradeInfo = await util.getTradeInfo(list, msg);
            let sumProfit = tradeInfo[2];
            for (const elem of tradeInfo[0]) {
                let arr = {
                    name: `${elem.status.toUpperCase()} - ${elem.name} - ${elem.symbol.toUpperCase()} (ID: ${elem.id})`,
                    value: `__Status__: ${(elem.session === "market") ? "**Market open**" : "**Market closed**"}\n__Change__: **${util.setRightNumFormat(elem.profitPercentage)}%**\n__By share__: Paid: **$${util.setRightNumFormat(elem.haspaid / elem.volume)}**, Now: **$${util.setRightNumFormat(elem.shownWorthTrade / elem.volume)}** (Profit: **$${(util.setRightNumFormat((elem.profit / elem.volume)))}**)\n__Your trade__: Paid: **$${util.setRightNumFormat(elem.haspaid)}**, Now: **$${util.setRightNumFormat(elem.shownWorthTrade)}** (Profit: **$${util.setRightNumFormat(elem.profit)}**)\n`
                };
                embedList.push(arr);
            }
            msg.channel.send(util.createEmbedMessage(msg, "008CFF", `Trades of ${displayName}`, embedList, `__Total profit:__ **$${util.setRightNumFormat(sumProfit)}**`));
        }
    }
}

//closetrade
async function closeTrade(msg) {
    if (await util.isAccountCreated(msg.author.id, true, msg)) {
        let id = parseInt(msg.content.split(" ")[1]);
        let titleMsg = "Error!"
        let arrMsg = {
            name: `Failed to close the trade n°**${id}**!`,
            value: `You asked for a trade which doesn't exist! Please try again. (Command **list** to see IDs)`
        }

        if (util.getTradeList(msg, msg.author.id, id) === undefined || isNaN(id)) {
            msg.channel.send(util.createEmbedMessage(msg, "FF0000", titleMsg, [arrMsg]));
        } else {
            let trade = await util.getTradeInfo([await util.getTradeList(msg, msg.author.id, id)], msg, msg.author.id);
            trade = trade[0];

            if(trade[0].worthTrade !== undefined && !isNaN(trade[0].worthTrade && trade !== "-1")){
                titleMsg = "Trade closed";
                arrMsg = {
                    name: `Trade n°**${id}** closed.`,
                    value: `You have earned **$${util.setRightNumFormat(trade[0].worthTrade)}**`
                }
                await util.updateMoney(msg, msg.author.id, trade[0].worthTrade);
                await util.updateList(msg, "del", [id]);
                showBalance(msg);

            }
            else if (trade !== "-1") {
                arrMsg = {
                    name: `Failed to close the trade n°**${id}**!`,
                    value: `The value retrieved by the service is invalid, please try later. If this error persist, please contact the support.`
                }
            }

            let earnedLost = (trade[0].profit > 0) ? ["earned", "56C114"] : ["lost", "FF0000"];
            msg.channel.send(util.createEmbedMessage(msg, earnedLost[1], titleMsg, [arrMsg]));

        }
    }
}

//newtrade
async function newTrade(msg) {
    if (await util.isAccountCreated(msg.author.id, true, msg)) {
        let status = msg.content.split(" ")[1];
        let symb = msg.content.split(" ")[2];
        let amount = msg.content.split(" ")[3];
        let resp = await util.getStockData([symb])
        let list = await util.getTradeList(msg, msg.author.id);

        switch(status){
            case "s":
                status = "sell";
                break;
            case "b":
                status = "buy";
                break;
        }

        if (resp[0].status === 0 || resp[0] === undefined || resp[0].price === undefined) {
            msg.channel.send("Unknown market! Please search one with `sm!search <name/symbol>` (ex: *sm!search Apple* or *sm!search AAPL*)");
        } else if ((status !== "buy" && status !== "sell") || isNaN(amount) || amount === "" || amount < 0) {
            msg.channel.send("Syntax error! Please try again. `sm!newtrade <buy/sell> <symbol> <amount>`");
        } else {
            let money = await util.getUserData(msg.author.id, "money");
            money = money[0]["money"];
            if (money - amount >= 0) {
                if (list.length >= 15) {
                    msg.channel.send(util.createEmbedMessage(msg, "FF0000", "Payement refused!",
                        [{
                            name: `List full!`,
                            value: `You have too many shares! (Max:15)`
                        }]));
                } else {
                    let vol = amount / resp[0].price;
                    await util.updateList(msg, "add", [symb, status, vol, amount]);

                    util.sql.query("UPDATE userdata SET money = ? WHERE id = ?", [money - amount, msg.author.id], function(err, result){if (err) throw err});

                    msg.channel.send(util.createEmbedMessage(msg, "56C114", "Payement accepted!",
                        [{
                            name: `${resp[0].name} - ${symb.toUpperCase()}`,
                            value: `You now own **${vol}** shares from this stock! (Type: ${status.toUpperCase()})`
                        }]));
                }
            } else {
                msg.channel.send(util.createEmbedMessage(msg, "FF0000", "Payement refused!",
                    [{
                        name: `${resp[0].name} - ${symb.toUpperCase()}`,
                        value: `You don't have enough money!`
                    }]));
            }
        }
    }
}

//ping
async function showPing(msg) {
    let start = Date.now();
    let timeMsg = start - msg.createdTimestamp;

    start = Date.now()
    await util.getStockData(["AAPL"])
    let timeAPI = Date.now() - start;

    console.log(`Bot: ${timeMsg}ms, API: ${timeAPI}ms`)

    msg.channel.send(util.createEmbedMessage(msg, "008CFF", "Pong!", [
        {
            name: `Results:`,
            value: `Bot: **${timeMsg}ms**\nStock Market - API: **${timeAPI}ms**`
        }
    ]));
}

//about
async function showAbout(msg, num) {
    util.sql.query("SELECT SUM(money), COUNT(*) FROM userdata",
        function(err, result){
            if (err) throw err
            let totalMoney = util.setRightNumFormat(result[0]['SUM(money)'], false);
            let totalMembers = util.setRightNumFormat(result[0]['COUNT(*)'], false);
            let arr = [
                {
                    name: `Stats:`,
                    value: `- Working with **${totalMembers}** traders, owning **$${totalMoney}** in their balance!\n- Doing my business on **${util.setRightNumFormat(num, false)}** servers!`
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
            msg.channel.send(util.createEmbedMessage(msg, "008CFF", "About the bot", arr));
        }
    );
}

//money_edit
async function moneyEdit(msg){
    msg.content = msg.content.split(" ");
    if(msg.author.id === ownerID && await util.isAccountCreated(msg.content[1], true, msg)){
        await util.updateMoney(msg, msg.content[1], parseFloat(msg.content[2]) || 0, msg.content[3] || 1);
    }
}

//trade_edit
// async function tradeEdit(msg){
//     if(msg.author.id === ownerID && await util.isAccountCreated(msg.content[1], true, msg)){
//
//     }
// }

//send_mp
function sendMp(msg, client){
    let splited = msg.content.split(" ");
    if(msg.author.id === ownerID){
        let user = client.users.cache.get(splited[1]);
        user.send(msg.content.substr((splited[0] + splited[1]).length + 1));
    }
}

module.exports = {
    searchMarket: searchMarket,
    initializeUser: initializeUser,
    deleteUser : deleteUser,
    showBalance: showBalance,
    getDaily: getDaily,
    showMarket: showMarket,
    showList: showList,
    closeTrade: closeTrade,
    newTrade: newTrade,
    showHelp: showHelp,
    showPing: showPing,
    showAbout: showAbout,
    setPrefix: setPrefix,
    // tradeEdit: tradeEdit,
    moneyEdit: moneyEdit,
    sendMp: sendMp
};
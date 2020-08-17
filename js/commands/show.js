const tool = require("../util/tools.js");
const smarket = require("../util/stockmarket.js");
const plot = require("../util/plot.js");

exports.run = async (client, msg, args) => {
    let msgBot = await msg.channel.send(tool.createEmbedMessage(msg, "FF8400", "Fetching data..."))
    let tag = args.split(' ')[0];
    if(!tag || tag === ""){
        msgBot.edit(tool.createEmbedMessage(msg, "FF0000", "Invalid syntax! Please type: show <symbol>"));
        return;
    }
    let resp = await smarket.getStockData([tag])
    resp = resp[0];
    try {
        if(resp){
            if(resp.status && resp.status !== 0){
                let status = (resp.session === "market") ? "open" : "closed";
                let update = "Unknown";
                if(resp.update){
                    if(resp.update === "streaming") {
                        update = "Instantaneous";
                    }
                    else if(resp.update.startsWith("delayed_streaming")){
                        update = `Delayed by ${parseInt(resp.update.split("delayed_streaming_")[1]) / 60} minutes`
                    }
                }
                let field = {
                    name: `Informations for ${resp.name} (${resp.symbol}): `,
                    value: `__Price__: **$${tool.setRightNumFormat(resp.price)}** (Change: **${resp.changesPercentage}%** => **$${tool.setRightNumFormat(resp.change)}**)\n__Status__: Currently ${status}\n__Update__: ${update}`
                }
                plot.getChart(tag, msg).then(() => {
                    msgBot.edit(tool.createEmbedMessage(msg, "008CFF", "Details", [field], `Chart available! (Tradingview's chart available [here](https://tradingview.com/chart/?symbol=${resp.symbol}))`, img=`${msg.id}.png`))
                        .then(() => plot.deleteCharts());
                }).catch(() =>{
                    msgBot.edit(tool.createEmbedMessage(msg, "008CFF", "Details", [field], `Chart available [here](https://tradingview.com/chart/?symbol=${resp.symbol}).`))
                });
                return;
            }
        }
        msgBot.edit(tool.createEmbedMessage(msg, "FF0000", "Nothing was found. Please try again with an other symbol."));
    } catch (e) {
        msgBot.edit(tool.createEmbedMessage(msg, "FF0000", "An error occurred (the request to the service may have been unsuccessful), please try again or contact the support!"));
        console.log(e)
    }
}

exports.config = {
    name: "Show",
    category: "Stock Market",
    usage: "show",
    description: "To get details about a particular market (ex: sm!show AAPL)",
    syntax: "<symbol>",
}
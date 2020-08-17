const tool = require("../util/tools.js");
const smarket = require("../util/stockmarket.js");
const plot = require("../util/plot.js");

exports.run = async (client, msg, args) => {
    let tag = args.split(' ')[0];
    let resp = await smarket.getStockData([tag])

    try {
        resp = resp[0];
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
            msg.channel.send(tool.createEmbedMessage(msg, "008CFF", "Details", [field], `Chart available! (Tradingview's chart available [here](https://tradingview.com/chart/?symbol=${resp.symbol}))`, img=`${msg.id}.png`))
                .then(() => plot.deleteCharts());
        }).catch(() =>{
            msg.channel.send(tool.createEmbedMessage(msg, "008CFF", "Details", [field], `Chart available [here](https://tradingview.com/chart/?symbol=${resp.symbol}).`))
        });

    } catch (e) {
        msg.channel.send("Nothing was found. Please try again with an another symbol.");
    }
}

exports.config = {
    name: "Show",
    category: "Stock Market",
    usage: "show",
    description: "To get details about a particular market (ex: sm!show AAPL)",
    syntax: "<symbol>",
}
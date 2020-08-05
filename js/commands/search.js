exports.run = async (client, msg, args) => {
    msg.channel.send("Regular markets: https://www.tradingview.com/screener/ \nCryptocurrencies: https://www.tradingview.com/crypto-screener/ \nFOREX: https://www.tradingview.com/forex-screener/")
}


exports.config = {
    name: "Search",
    category: "Stock Market",
    usage: "search",
    description: "To search for stock markets",
}
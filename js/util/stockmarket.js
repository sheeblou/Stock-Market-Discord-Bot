const tdvApi = require("tradingview-scraper");
const tv = new tdvApi.TradingViewAPI();

function getStockData(tagArray = []) {
    let data = [];
    return new Promise((resolve) => {
        let i = 0;
        let size = tagArray.length
        // I'm sure this is ugly, but it works.
        tagArray.forEach(tag => {
            tv.getTicker(tag)
                .then((resp) => {
                    data.push({
                        status: 1,
                        session: resp.current_session,
                        update: resp.update_mode,
                        price: resp.lp || resp.bid,
                        symbol: resp.short_name.toUpperCase(),
                        symbol_pro: resp.pro_name.toUpperCase(),
                        name: resp.description,
                        changesPercentage: resp.chp,
                        change: resp.ch,
                        lastupdate: resp.last_update,
                    })
                    i++
                    if (i >= size) {
                        resolve(data)
                    }

                }
                ).catch((err) => {
                    console.log(err)
                    data.push({
                        status: 0
                    })
                    i++
                    if (i >= size) resolve(data)
            })
        })
    })
}

module.exports = {
    getStockData: getStockData,
};
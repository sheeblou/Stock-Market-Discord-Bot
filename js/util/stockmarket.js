const tdvApi = require('tradingview-scraper');

const tv = new tdvApi.TradingViewAPI();

function deleteSubscriptions(){
	return new Promise((resolve, reject) => {
		if(tv.subscriptions.length > 50 ){
			for(let i = 0; i < tv.subscriptions.length; i++) {
				console.log(i, tv.subscriptions.length)
				delete tv.tickerData[tv.subscriptions[i]]
			}
			tv.subscriptions = [];
		}
		resolve();
	});
}

function getStockData(tagArray = []) {
	const data = [];
	return new Promise((resolve) => {
		let i = 0;
		const size = tagArray.length;
		// I'm sure this is ugly, but it works.
		tagArray.forEach((tag) => {
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
					});
					i++;
					if (i >= size) {
						console.log(tv.subscriptions, tv.subscriptions.length)
						// console.log("v1", tv.tickerData, tv.subscriptions, tv.subscriptions.length)
						// deleteSubscriptions().then(() => {
						// 	console.log("v2", tv.tickerData, tv.subscriptions, tv.subscriptions.length)
						// 	resolve(data);
						// })
						resolve(data);
					}
				}).catch((err) => {
					console.log(err);
					data.push({
						status: 0,
					});
					i++;
					if (i >= size) resolve(data);
				});
		});
	});
}

module.exports = {
	getStockData,
};

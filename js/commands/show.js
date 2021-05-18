const fs = require('fs');
const tool = require('../util/tools.js');
const smarket = require('../util/stockmarket.js');
const plot = require('../util/plot.js');

exports.run = async (client, msg, args) => {
	const msgBot = await msg.channel.send(tool.createEmbedMessage(msg, 'FF8400', '<load:844221104380969021> Fetching data'));
	const tag = args.split(' ')[0];
	if (!tag || tag === '') {
		msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'Invalid syntax! Please type: show <symbol>'));
		return;
	}
	let resp = await smarket.getStockData([tag], false);
	[resp] = resp;
	try {
		if (resp) {
			if(!resp.price)
				throw new Error("StockDataNotComplete");
			if (resp.status && resp.status !== 0) {
				const status = (resp.session === 'market') ? 'open' : 'closed';
				let update = 'Unknown';
				if (resp.update) {
					if (resp.update === 'streaming') {
						update = 'Instantaneous';
					} else if (resp.update.startsWith('delayed_streaming')) {
						update = `Delayed by ${parseInt(resp.update.split('delayed_streaming_')[1], 10) / 60} minutes`;
					}
				}
				const field = {
					name: `Informations for ${resp.name} (${resp.symbol}): `,
					value: `__Price__: **$${tool.setRightNumFormat(resp.price)}** (Change: **${resp.changesPercentage}%** => **$${tool.setRightNumFormat(resp.change)}**)\n__Status__: Currently ${status}\n__Update__: ${update}`,
				};
				plot.getChart(tag, msg).then(() => {
					if (fs.existsSync(`img/${msg.id}.png`)) {
						msgBot.edit(tool.createEmbedMessage(msg, '008CFF', 'Details', [field], `Chart available! (Tradingview's chart available [here](https://tradingview.com/chart/?symbol=${resp.symbol}))`, `${msg.id}.png`));
						msg.channel.send(tool.createEmbedMessage(msg, '008CFF', '', [{ name: 'Chart', value: resp.symbol }], '', `${msg.id}.png`)).catch((e) => {
							console.log(e);
						});
					}
				}).catch(() => {
					msgBot.edit(tool.createEmbedMessage(msg, '008CFF', 'Details', [field], `Chart available [here](https://tradingview.com/chart/?symbol=${resp.symbol}).`));
				}).finally(() => plot.deleteCharts());
				return;
			}
		}
		msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'Nothing was found. Please try again with an other symbol.'));
	} catch (e) {
		msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'An error occurred (the request to the service may have been unsuccessful), please try again or contact the support!'));
		console.log(e);
	}
};

exports.config = {
	name: 'Show',
	category: 'Stock Market',
	usage: 'show',
	description: 'To get details about a particular market (ex: sm!show AAPL)',
	syntax: '<symbol>',
};

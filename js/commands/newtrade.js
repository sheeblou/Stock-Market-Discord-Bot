const mysql = require('../util/mysql.js');
const tool = require('../util/tools.js');
const smarket = require('../util/stockmarket.js');

function editStatus(status) {
	const aliasesStatus = {
		b: 'buy',
		buy: 'buy',
		s: 'sell',
		sell: 'sell',
		short: 'sell'
	};
	return aliasesStatus[status] || undefined;
}

async function determinePriceToPay(amount, str, infoStock) {
	const limitedAmount = 10000;
	let edited = undefined;
	let tempAmount = parseFloat(amount || -1);
	if (str === 's' || str === 'share') {
		tempAmount = amount * infoStock.price;
	}
	// if (amount > limitedAmount) {
	// 	if (infoStock.update) {
	// 		if (infoStock.update.startsWith('delayed_streaming')) {
	// 			tempAmount = limitedAmount;
	// 			edited = 'delayed';
	// 		}
	// 	} else if (await mysql.isMarketLimited(infoStock.symbol)
	// 		|| await mysql.isMarketLimited(infoStock.symbol_pro)) {
	// 		tempAmount = limitedAmount;
	// 		edited = 'limited';
	// 	}
	// }
	return [tempAmount, edited];
}

exports.run = async (client, msg, args) => {
	const msgBot = await msg.channel.send(tool.createEmbedMessage(msg, 'FF8400', 'Creating trade...'));

	if (await mysql.isAccountCreated(msg.author.id, true, msg, msgBot)) {
		const splited = args.split(' ');
		const status = editStatus(splited[0]);
		const symb = splited[1];
		const byShare = splited[3];
		let resp;
		if(symb)
			resp = await smarket.getStockData([symb]);
		const list = await mysql.getTradeList(msg, msg.author.id);
		if (!list) {
			return msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'Something went terribly wrong! Please try again or contact the support.'));
		}
		if (!resp || !resp[0] || resp[0].status === 0 || !resp[0].price) {
			return msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'Unknown market! Please search one with sm!search'));
		}
		const infoPrice = await determinePriceToPay(splited[2], byShare, resp[0]);
		const amount = infoPrice[0];
		const edited = infoPrice[1];
		if (!status || !amount || amount < 0) {
			msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'Syntax error! Please try again. sm!newtrade <buy/sell> <symbol> <amount> <optional: share/s>'));
		} else {
			let money = await mysql.getUserData(msg.author.id, 'money');
			money = money[0].money;
			if (money - amount >= 0) {
				if (list.length >= 15) {
					msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'Payment refused!',
						[{
							name: 'List full!',
							value: 'You own too many trades! (Max:15)',
						}]));
				} else {
					const vol = amount / resp[0].price;
					const usedSymb = symb.toUpperCase() === resp[0].symbol_pro
						? resp[0].symbol_pro : resp[0].symbol;
					await mysql.updateList(msg, 'add', [usedSymb, status, vol, amount]);

					mysql.sql.query('UPDATE userdata SET money = ? WHERE id = ?', [money - amount, msg.author.id], (err) => {
						if (err) throw err;
					});
					msgBot.edit(tool.createEmbedMessage(msg, '56C114', 'Payment accepted!',
						[{
							name: `${resp[0].name} - ${symb.toUpperCase()}`,
							value: `You now own **${vol}** shares from this stock! (Type: ${status.toUpperCase()})`,
						}]));
					if (edited === 'limited' || edited === 'delayed') {
						msg.channel.send(tool.createEmbedMessage(msg, 'FF0000', `Warning, you are using a ${edited} market. Only $10K have been deducted from your balance.`));
					}
				}
			} else {
				return msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'Payment refused!',
					[{
						name: `${resp[0].name} - ${symb.toUpperCase()}`,
						value: 'You don\'t have enough money! (Or an invalid amount has been entered!)',
					}]));
			}
		}
	}
};

exports.config = {
	name: 'New trade',
	category: 'Stock Market',
	usage: 'newtrade',
	aliases: ['nt'],
	description: 'To trade stocks on the market '
		+ '(`sm!newtrade buy AAPL 5000`)\n'
        + '==>buy if you think the stock will go up,\n'
        + '==>sell if you think the stock will go down.\n'
		+ 'Adding "s" or "share" at the end of the command will specify an amount of shares to buy/sell '
		+ '(ex: `sm!newtrade buy BTCUSD 1 s` will exactly buy 1 bitcoin)',
	syntax: '<buy/sell> <symbol> <price> <optional: share/s>\n'
		+ 'newtrade <b/s> <symbol> <price> <optional: share/s>',
};

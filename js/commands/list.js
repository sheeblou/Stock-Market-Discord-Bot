const mysql = require('../util/mysql.js');
const tool = require('../util/tools.js');

exports.run = async (client, msg, args) => {
	const msgBot = await msg.channel.send(tool.createEmbedMessage(msg, 'FF8400', 'Fetching data...'));
	const targetUser = await tool.getUser(msg, args, msgBot);
	if (!targetUser) {
		return;
	}
	const displayName = (msg.guild !== null) ? targetUser.displayName : msg.author.username;

	if (await mysql.isAccountCreated(targetUser.id, true, msg, msgBot)) {
		const list = await mysql.getTradeList(msg, targetUser.id);
		if (!list) {
			msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'Something went terribly wrong! Please try again or contact the support.'));
			return;
		}
		const embedList = [];

		if (list.length <= 0) {
			msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', (targetUser.id !== msg.author.id) ? `${displayName} doesn't own any share!` : "You don't own any share!"));
		} else {
			const tradeInfo = await mysql.getTradeInfo(list, msg);
			const tradeData = tradeInfo[0];
			const sumProfit = tradeInfo[2];
			for (let i = 0; i < tradeData.length; i++) {
				let updateStream = '/ **Unknown**';
				if (tradeData[i].update) {
					if (tradeData[i].update === 'streaming') {
						updateStream = '/ **Instantaneous**';
					} else if (tradeData[i].update.startsWith('delayed_streaming')) {
						updateStream = `/ **Delayed by ${parseInt(tradeData[i].update.split('delayed_streaming_')[1], 10) / 60} minutes**`;
					}
				}
				if (!tradeData[i].status || (tradeData[i].status.toUpperCase() !== 'SELL' && tradeData[i].status.toUpperCase() !== 'BUY')) {
					tradeData[i].status = 'BUY';
				}
				const arr = {
					name: `${tradeData[i].status.toUpperCase()} - ${tradeData[i].name} - ${tradeData[i].symbol.toUpperCase()} (ID: ${tradeData[i].id})`,
					value: `__Status__: ${(tradeData[i].session === 'market') ? '**Market open**' : '**Market closed**'} ${updateStream}\n__Change__: **${tool.setRightNumFormat(tradeData[i].profitPercentage)}%**\n__By share__: Paid: **$${tool.setRightNumFormat(tradeData[i].haspaid / tradeData[i].volume)}**, Now: **$${tool.setRightNumFormat(tradeData[i].shownWorthTrade / tradeData[i].volume)}** (Profit: **$${(tool.setRightNumFormat((tradeData[i].profit / tradeData[i].volume)))}**)\n__Your trade__: Paid: **$${tool.setRightNumFormat(tradeData[i].haspaid)}**, Now: **$${tool.setRightNumFormat(tradeData[i].shownWorthTrade)}** (Profit: **$${tool.setRightNumFormat(tradeData[i].profit)}**)\n`,
				};
				embedList.push(arr);
			}
			msgBot.edit(tool.createEmbedMessage(msg, '008CFF', `Trades of ${displayName}`, embedList, `__Total profit:__ **$${tool.setRightNumFormat(sumProfit)}**`));
		}
	}
};

exports.config = {
	name: 'List',
	category: 'Player Account',
	usage: 'list',
	aliases: ['lt'],
	description: "Your / user's current trades",
	syntax: '/ list @User',
};

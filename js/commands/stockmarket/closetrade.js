const mysql = require('../../util/mysql.js');
const tool = require('../../util/tools.js');
const balCmd = require('../general/balance.js');

exports.run = async (client, msg, args) => {
	const msgBot = await msg.channel.send(tool.createEmbedMessage(msg, 'FF8400', 'Closing trade...'));

	if (await mysql.isAccountCreated(msg.author.id, true, msg, msgBot)) {
		const id = parseInt(args.split(' ')[0], 10);
		let titleMsg = 'Error!';
		let arrMsg = {
			name: `Failed to close the trade n°**${id}**!`,
			value: 'You asked for a trade which doesn\'t exist! Please try again. (Command **list** to see IDs)',
		};

		if (isNaN(id) || mysql.getTradeList(msg, msg.author.id, id) === undefined) {
			msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', titleMsg, [arrMsg]));
		} else {
			const list = await mysql.getTradeList(msg, msg.author.id, id);
			let trade = await mysql.getTradeInfo([list], msg, msg.author.id);
			[trade] = trade;

			if (!trade[0]) {
				return;
			}
			if (!isNaN(trade[0].worthTrade) && !isNaN(trade[0].profit) && trade !== '-1') {
				titleMsg = 'Trade closed';
				arrMsg = {
					name: `Trade n°**${id}** closed.`,
					value: `You have earned **$${tool.setRightNumFormat(trade[0].worthTrade)}**`,
				};
				await mysql.updateMoney(msg, msg.author.id, trade[0].worthTrade);
				await mysql.updateList(msg, 'del', [id]);
				await balCmd.run(client, msg);
			} else if (trade !== '-1' && (isNaN(trade[0].worthTrade) || isNaN(trade[0].profit))) {
				arrMsg = {
					name: `Failed to close the trade n°**${id}**!`,
					value: 'The value retrieved by the service is invalid, please try later. If this error persist, please contact the support.',
				};
			}

			const earnedLost = (trade[0].profit > 0) ? ['earned', '56C114'] : ['lost', 'FF0000'];
			msgBot.edit(tool.createEmbedMessage(msg, earnedLost[1], titleMsg, [arrMsg]));
		}
	}
};

exports.config = {
	name: 'Close trade',
	category: 'Stock Market',
	usage: 'closetrade',
	aliases: ['ct'],
	description: 'Close a trade (the ID can be found with the list command). Give to you the final value of your trade.',
	syntax: '<ID>',
};

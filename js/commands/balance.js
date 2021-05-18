const mysql = require('../util/mysql.js');
const tool = require('../util/tools.js');

exports.run = async (client, msg, args) => {
	const msgBot = await msg.channel.send(tool.createEmbedMessage(msg, 'FF8400', '<load:844221104380969021> Fetching data'));
	const targetUser = await tool.getUser(msg, args, msgBot);
	if (!targetUser) {
		return;
	}
	const displayName = (msg.guild !== null) ? targetUser.displayName : msg.author.username;

	if (await mysql.isAccountCreated(targetUser.id, true, msg, msgBot)) {
		let userMoney = await mysql.getUserData(targetUser.id, 'money');
		userMoney = userMoney[0].money;
		const arr = [{
			name: `Balance of ${displayName}:`,
			value: `**$${tool.setRightNumFormat(userMoney)}**`,
		}];
		const list = await mysql.getTradeList(msg, targetUser.id);
		if (!list) {
			msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'Something went terribly wrong! Please try again or contact the support.'));
			return;
		}
		if (list.length > 0) {
			const sumProfit = await mysql.getTradeInfo(list, msg);
			const symb = sumProfit[2] > 0 ? '+' : '';
			arr.push({
				name: 'Net worth with current trades (profit / loss)',
				value: `**$${tool.setRightNumFormat(sumProfit[1] + userMoney)}** (**${symb}$${tool.setRightNumFormat(sumProfit[2])}**)`,
			});
		}
		msgBot.edit(tool.createEmbedMessage(msg, '008CFF', 'Balance', arr));
	}
};

exports.config = {
	name: 'Balance',
	category: 'Player Account',
	description: "To admire your / user's wealth",
	usage: 'balance',
	aliases: ['bal'],
	syntax: '/ balance @User',
};

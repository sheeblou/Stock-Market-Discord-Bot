const mysql = require('../util/mysql.js');
const tool = require('../util/tools.js');

function getUsersStats(client, msg) {
	return new Promise((resolve, reject) => {
		const arrIds = [];
		msg.guild.members.cache.forEach((r) => {
			arrIds.push(r.id);
		});

		const statsUsers = [];
		mysql.sql.query('SELECT id, money, trades FROM `userdata` WHERE id in (?)', [arrIds],
			(err, result) => {
				if (!result || result.length === 0) {
					reject();
				}
				let i = 0;
				const lenghtR = result.length;
				result.forEach((r) => {
					mysql.getTradeList(msg, r.id, null, [r]).then((k) => {
						mysql.getTradeInfo(k, msg).then((j) => {
							msg.guild.members.fetch(r.id).then((m) => {
								i++;
								statsUsers.push([(j[1] || 0) + r.money, m.displayName, m.id]);

								if (i >= lenghtR) {
									resolve(statsUsers);
								}
							}).catch((e) => console.log(e));
						});
					});
				});
			});
	});
}

exports.run = async (client, msg) => {
	const msgBot = await msg.channel.send(tool.createEmbedMessage(msg, 'FF8400', 'Fetching data...'));
	if (!msg.guild) {
		return msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'Error! Leaderboards are used in servers!'));
	}
	const order = ['1st', '2nd', '3rd'];
	const msgArray = [];
	getUsersStats(client, msg).then((usersList) => {
		usersList.sort((a, b) => b[0] - a[0]);
		const posUser = tool.getSpecificColumn(usersList, 2).indexOf(msg.author.id.toString()) + 1;
		const numUsers = usersList.length;
		for (let i = 0; i < usersList.length && i < 10; i++) {
			msgArray.push({
				name: `${order[i] || (`${i + 1}th`)} - ${usersList[i][1]}`,
				value: `$${tool.setRightNumFormat(usersList[i][0])}`,
			});
		}
		const footer = posUser !== 0 ? `You are ranked ${posUser}/${numUsers}` : `${numUsers} users are registered on this server`;
		msgBot.edit(tool.createEmbedMessage(msg, '008CFF', 'Leaderboard', msgArray, null, null, footer))
			.then(() => msg.channel.send("This command does not work as expected. Some users may be missing."));
	}).catch((err) => {
		msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'Error! No users are registered on the server!'));
		console.log(err);
	});
};

exports.config = {
	name: 'Leaderboard',
	category: 'Stock Market',
	usage: 'leaderboard',
	aliases: ['ld', 'top'],
	description: 'Who is the richest in your server?',
};

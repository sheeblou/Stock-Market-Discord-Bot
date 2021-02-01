const mysql = require('../../util/mysql.js');

exports.run = async (client, msg, args) => {
	const splited = args.split(' ');
	let market = splited[1];
	if (market) {
		market = market.toUpperCase();
		const isMarketLimitedExist = await mysql.isMarketLimited(market);
		if (splited[0] === 'add') {
			if (isMarketLimitedExist) {
				msg.channel.send(`${market} is already limited!`);
				return;
			}
			mysql.sql.query('INSERT INTO limited_markets VALUES(?)', [market], (err) => { if (err) throw (err); });
			msg.channel.send(`${market} is now limited!`);
		} else if (splited[0] === 'rem') {
			if (!isMarketLimitedExist) {
				msg.channel.send(`${market} is not limited!`);
				return;
			}
			mysql.sql.query('DELETE FROM limited_markets WHERE markets = ?', [market], (err) => { if (err) throw (err); });
			msg.channel.send(`${market} is not limited anymore!`);
		}
	}
};

exports.config = {
	name: 'Limit Market',
	category: 'Admin',
	usage: 'limit_market',
	aliases: ['lm'],
	description: 'Limit a market.',
	syntax: '<add/rem> <symbol>',
	permissions: {
		BOT_PERMISSIONS: ['OWNER'],
	},
};

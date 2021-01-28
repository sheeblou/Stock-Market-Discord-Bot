const DBL = require('dblapi.js');
const mysql = require('../util/mysql.js');
const smarket = require('../util/stockmarket.js');

module.exports = async (client) => {
	try {
		console.log(`Logged ! ${client.user.tag}`);
		client.user.setPresence({
			activity: {
				name: `${client.guilds.cache.size} servers! | sm!help`,
				type: 'WATCHING',
				url: 'https://www.twitch.tv/monstercat',
			},
		});
		mysql.sql.connect((err) => {
			if (err) throw err;
			console.log('Connected!');
		});
		if (process.env.npm_lifecycle_event !== 'dev') {
			const dbl = new DBL(client.config.topggToken, client);
			setInterval(() => {
				mysql.postStats(client);
				smarket.deleteSubscriptions()
					.then(() => console.log("SUBSCRIPTIONS DELETED"))
					.catch((err) => console.log(`SUBSCRIPTIONS COULDN'T BE DELETED : ${err}`))
				const size = client.guilds.cache.size || client.guilds.size;
				if (size) {
					dbl.postStats(size).then(() => console.log(`STAT POSTED WITH ${size}`)).catch((err) => console.log(`ERROR: STATS NOT POSTED ${err}`));
				}
			}, 3600 * 1000 * 2);
		}
	} catch (e) {
		console.log(e);
	}
};

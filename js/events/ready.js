const DBL = require('dblapi.js');
const mysql = require('../util/mysql.js');
const smarket = require('../util/stockmarket.js');
const tools = require('../util/tools.js')

module.exports = async (client) => {
	try {
		console.log(`Logged ! ${client.user.tag}`);
		tools.updateBotStatus(client);
		if (process.env.npm_lifecycle_event !== 'dev' && client.options.shards && client.options.shards[0] === 0) {
			const dbl = new DBL(process.env.TOPGG_TOKEN, client);
			setInterval(() => {
				mysql.postStats(client);
				tools.getTotalServersOnBot(client).then((size) =>{
					if (size) {
						dbl.postStats(size).then(() => console.log(`STAT POSTED WITH ${size}`)).catch((err) => console.log(`ERROR: STATS NOT POSTED ${err}`));
					}
				})
			}, 3600 * 1000 * 1);
		}
	} catch (e) {
		console.log(e);
	}
};

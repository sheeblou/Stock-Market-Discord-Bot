const mysql = require('../util/mysql.js');
const tool = require('../util/tools.js');

module.exports = async (client, guild) => {
	try {
		mysql.getPrefixServer(guild.id).then((r) => {
			if (r[1]) {
				mysql.sql.query('DELETE FROM prefixserver WHERE id = ?', [guild.id], (err) => { if (err) throw err; });
			}
		});
		tool.updateBotStatus(client);
		console.log(`LEFT ${guild.id} - ${guild.name} - ${guild.memberCount} - (${client.users.cache.size})`);
	} catch (e) {
		console.log(e);
	}
};

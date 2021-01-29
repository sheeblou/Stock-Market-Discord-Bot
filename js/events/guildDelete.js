const mysql = require('../util/mysql.js');
const tool = require('../util/tools.js');

module.exports = async (client, guild) => {
	try {
		mysql.getPrefixServer(guild.id).then((r) => {
			if (r[1]) {
				mysql.sql.query('DELETE FROM prefixserver WHERE id = ?', [guild.id], (err) => { if (err) throw err; });
			}
		});
		client.user.setPresence({ activity: { name: `${await tool.getTotalServersOnBot(client)} servers! | sm!help`, type: 'WATCHING', url: 'https://www.twitch.tv/monstercat' } });
		console.log(`LEFT ${guild.id} - ${guild.name} - ${guild.memberCount} - (${client.users.cache.size})`);
	} catch (e) {
		console.log(e);
	}
};

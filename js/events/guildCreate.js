const tool = require('../util/tools.js');

module.exports = async (client, guild) => {
	try {
		let defChannel = '';
		await Array.from(guild.channels.cache.values()).forEach((channel) => {
			if (channel.type === 'text' && defChannel === '' && channel.permissionsFor(guild.me).has('SEND_MESSAGES') && channel.permissionsFor(guild.me).has('VIEW_CHANNEL')) {
				defChannel = channel;
				defChannel.send('Hey! To get started type `sm!help` !').catch(() => {
					defChannel = '';
				});
			}
		});
		if (defChannel === '') {
			guild.fetchAuditLogs({ type: 'BOT_ADD', limit: 1 }).then((log) => {
				log.entries.first().executor
					.send("Hey! Thank you for adding me, unfortunately I can't send any messages on the server, please check my permissions!\nHappy trading!")
					.catch(() => console.log("Couldn't send any message when joining the server. (Server & PM)"));
			})
				.catch(() => guild.owner.send("Hey! Someone added me on your server (but I couldn't know who), unfortunately I can't send any messages on the server, please check my permissions!\nHappy trading!").catch(() => console.log("Couldn't send msg to owner")));
		}
		tool.updateBotStatus(client);
		console.log(`JOINED ${guild.id} - ${guild.name} - ${guild.memberCount} - (${client.users.cache.size})`);
	} catch (e) {
		console.log(e);
	}
};

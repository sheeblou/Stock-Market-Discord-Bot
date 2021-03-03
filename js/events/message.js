const mysql = require('../util/mysql.js');

const coolDownSet = new Set();

module.exports = async (client, msg) => {
	if (msg.author.bot || !msg.content) return;
	const lcMsgContent = msg.content.toLowerCase();
	const sMsg = lcMsgContent.split(' ');

	if (msg.guild === null && msg.author.id !== client.user.id && !lcMsgContent.startsWith('sm!')) {
		console.log(`DM: ${msg.author.id} - ${msg.content}`);
		const owner = await client.users.fetch(process.env.BOT_OWNERID);
		owner.send(`${msg.author.id} (${msg.author.username}#${msg.author.discriminator}) - ${msg.content}`);
	}

	const idServer = (msg.guild !== null) ? msg.guild.id : '-1';
	mysql.getPrefixServer(idServer).then((r) => {
		const prefix = (msg.guild !== null) ? (r[0] ? r[0].toLowerCase() : 'sm!') : 'sm!';
		if (prefix && lcMsgContent.startsWith(prefix)) {
			try {
				console.log(`${msg.author.id} - ${msg.content}`);
				const cmdTxt = sMsg[0].split(prefix)[1];
				const cmd = client.commands.get(cmdTxt) || client.commands.get(client.aliases.get(cmdTxt));
				if (!cmd) { return; }
				if (cmd.config.guildOnly && msg.guild === null) {
					return msg.channel.send("You can't use this command in a pm!");
				}
				if (cmd.config.permissions) {
					if (cmd.config.permissions.BOT_PERMISSIONS !== undefined && cmd.config.permissions.BOT_PERMISSIONS.includes('OWNER') && msg.author.id !== process.env.BOT_OWNERID) {
						return msg.channel.send('Only the owner of the bot can use this command!');
					} if (cmd.config.permissions.SERVER_PERMISSIONS) {
						const perms = msg.channel.permissionsFor(msg.author.id);
						if (!perms.has('ADMINISTRATOR') && !perms.has(cmd.config.permissions.SERVER_PERMISSIONS)) {
							return msg.channel.send(`You don't have enough permissions! (You need to have \`ADMINISTRATOR\` or \`${cmd.config.permissions.SERVER_PERMISSIONS}\` permission on the server)`); }
					}
				}

				if (coolDownSet.has(msg.author.id)) {
					msg.channel.send(`Please wait ${process.env.BOT_COOLDOWN | 0} seconds before using another command!`);
				} else {
					const args = msg.content.slice(prefix.length + sMsg[0].split(prefix)[1].length).trim();
					cmd.run(client, msg, args);
					coolDownSet.add(msg.author.id);
					setTimeout(() => coolDownSet.delete(msg.author.id), (process.env.BOT_COOLDOWN | 0) * 1000);
				}
			} catch (e) {
				msg.channel.send(`${'Something went terribly wrong! Please send the following text to Cryx#7291\n'
                    + '```\n'}${e}\n\`\`\``);
				console.log(e);
			}
		}

		if (msg.content.startsWith(`<@!${client.user.id}>`) || msg.content.startsWith(`<@${client.user.id}>`)) {
			msg.channel.send(`My prefix is \`${r[0]}\` (e.g: \`${r[0]}help\`)`);
		}
	});
};

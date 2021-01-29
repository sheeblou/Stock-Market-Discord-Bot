const mysql = require('../util/mysql.js');
const tool = require('../util/tools.js');

exports.run = async (client, msg) => {
	const msgBot = await msg.channel.send(tool.createEmbedMessage(msg, 'FF8400', 'Fetching data...'));

	mysql.sql.query('SELECT SUM(money), COUNT(*) FROM userdata WHERE money<1000000000000',
		(err, result) => {
			if (err) throw err;
			const totalMoney = tool.setRightNumFormat(result[0]['SUM(money)'], false);
			const totalMembers = tool.setRightNumFormat(result[0]['COUNT(*)'], false);
			const arr = [
				{
					name: 'Stats:',
					value: `- Working with **${totalMembers}** traders, owning **$${totalMoney}** in their balance!\n- Doing my business on **${tool.setRightNumFormat(client.guilds.cache.size, false)}** servers!`,
				},
				{
					name: 'Need support?',
					value: 'https://discord.gg/K3tUKAV or send a pm to the bot!',
				},
				{
					name: 'Source code:',
					value: 'https://github.com/cryx3001/Stock-Market-Discord-Bot',
				},
				{
					name: 'Invite me on your server!',
					value: 'https://discord.com/oauth2/authorize?client_id=700690470891814912&scope=bot&permissions=8'
				},
				{
					name: 'Donate!',
					value: '**BTC :** `3CsrqouBbDToyoZH4XCq3yjs5DoCPMG3Ba`\n**ETH :** `0x8ACba400cACFb79977c607aAEFDf71De35405076`',
				},
			];
			msgBot.edit(tool.createEmbedMessage(msg, '008CFF', 'About the bot', arr));
		});
};

exports.config = {
	name: 'About',
	category: 'Basics',
	usage: 'about',
	aliases: ['ab'],
	description: 'Give informations about the bot.',
};

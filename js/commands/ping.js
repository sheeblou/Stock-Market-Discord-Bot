const tool = require('../util/tools.js');
const smarket = require('../util/stockmarket.js');
const mysql = require('../util/mysql.js');

exports.run = async (client, msg) => {
	const msgBot = await msg.channel.send(tool.createEmbedMessage(msg, 'FF8400', 'Pinging...'));
	const timeBOT = msg.client.ws.ping;

	let start = Date.now();
	await smarket.getStockData(['AAPL'], false);
	const timeAPI = Date.now() - start;

	start = Date.now();
	await mysql.isAccountCreated(msg.author.id, false, msg);
	const timeSQL = Date.now() - start;

	console.log(`Bot: ${timeBOT}ms, API: ${timeAPI}ms, MySQL: ${timeSQL}ms`);

	let resultsShards = await tool.checkStatusShards(client);
	let shardText = "";
	for(let i = 0; i < process.env.BOT_NUMSHARDS; i++){
		shardText += `**SHARD ${i}** ${client.options.shards[0] === i ? "(Me!)" : ""}: `;
		const elem = resultsShards.find(e => e[0] === i);
		shardText +=  (elem === undefined ? "*DEAD*" : (elem[1] === 200 ? "*ALIVE*" : "*API ERROR*")) + "\n";
	}
	const text = [
		{
			name: 'Results:',
			value: `Bot: **${timeBOT}ms**\nStock Market - API: **${timeAPI}ms**\nDatabase: **${timeSQL}ms**`,
		},
		{
			name: 'Shards results',
			value: shardText,
		},
	]

	msgBot.edit(tool.createEmbedMessage(msg, '008CFF', 'Pong!', text));
};

exports.config = {
	name: 'Ping!',
	category: 'Basics',
	usage: 'ping',
	aliases: ['pong'],
	description: 'To see the latency between the bot, you, the API and the database',
};

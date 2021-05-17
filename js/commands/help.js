const tool = require('../util/tools.js');

exports.run = (client, msg, args) => {
	if (args) {
		const cmd = client.commands.get(args.toLowerCase())
			|| client.commands.get(client.aliases.get(args.toLowerCase()));
		if (cmd) {
			return msg.channel.send(tool.createEmbedMessage(msg, '008CFF', cmd.config.name,
				[
					{
						name: 'Description',
						value: cmd.config.description,
					},
					{
						name: 'Usage',
						value: `${cmd.config.usage} ${cmd.config.syntax || ''}`,
					},
					{
						name: 'Aliases',
						value: `${cmd.config.aliases || 'None'}`,
					},
				]));
		}
	}

	return msg.channel.send(tool.createEmbedMessage(msg, '008CFF', 'Help!',
		[
			{
				name: 'Basics',
				value: "- `help` Shows this message \n"
					+ '- `init <amount>` Opens your account\n'
					+ '*(You can specify how much money to start with; Defaults to 100000)*\n'
					+ '- `del` Delete your account from the database (__This action cannot be reversed__)\n'
					+ '- `prefix <prefix>` Change the prefix of the bot\n'
					+ '- `ping` To see the latency between you, the bot and the API\n'
					+ '- `about` About the bot\n',
			},
			{
				name: 'Account Info',
				value: "- `balance` or `balance @User` To admire your / user's wealth\n"
					+ "- `list` / `list @User` Your / user's current trades\n"
					+ '- `daily` To get your daily reward\n'
					+ '- `vote` Vote for the bot and get a reward\n'
					+ '- `leaderboard` Who is the richest in your server? (Not working)\n',
			},
			{
				name: 'Trading',
				value: '- `search` Search for tickers and markets compatible with the bot\n'
					+ '- `show <stock>` Get info about a ticker (ex: `sm!show AAPL`)\n'
					+ '- `nt <buy/short> <ticker> <price/shares>` Buy/short stocks or cryptocurrency\n'
					+ '*(ex: `sm!nt buy AAPL 100 s` will buy 100 shares of apple, `sm!nt buy AAPL 100` will buy 100 dollars worth of apple shares)*\n'
					+ '*(When shorting, you gain money as the asset goes down. Think of it as a reverse investment)*\n'
					+ '- `ct <ID>` Closes a trade. The ID can be found with the `list` command (ex: `sm!ct 0`)\n',

			},
			{
				name: '*Available aliases*',
				value: 'Type `help <command>`\n',
			},
			{
				name: 'Support',
				value: '[Invite](https://discord.com/oauth2/authorize?client_id=700690470891814912&scope=bot&permissions=8)\n'
					+ '[Support Server](https://discord.gg/K3tUKAV)\n'
			},
		])).catch((e) => {
		if (e.message === 'Missing Permissions') {
			msg.author.send("I can't send any messages in this channel! Please give me the needed permissions to send messages!");
		}
	});
};

exports.config = {
	name: 'Help!',
	category: 'Basics',
	usage: 'help',
	description: "You're here",
};

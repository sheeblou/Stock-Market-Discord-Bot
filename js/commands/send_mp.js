exports.run = async (client, msg, args) => {
	const splited = args.split(' ');
	const user = client.users.cache.get(splited[0]);
	user.send(args.substr((splited[0]).length + 1));
};

exports.config = {
	name: 'Send a private message to someone via the bot',
	category: 'Admin',
	usage: 'send_mp',
	aliases: ['sp'],
	description: 'Send a private message',
	syntax: '<idTarget> <message>',
	guildOnly: false,
	permissions: {
		BOT_PERMISSIONS: ['OWNER'],
	},
};

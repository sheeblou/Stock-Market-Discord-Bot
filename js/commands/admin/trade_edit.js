exports.run = async () => {};

exports.config = {
	name: 'Trade edit',
	category: 'Admin',
	usage: 'trade_edit',
	aliases: ['te'],
	description: 'Edit the trades of someone',
	guildOnly: false,
	permissions: {
		BOT_PERMISSIONS: ['OWNER'],
	},
};

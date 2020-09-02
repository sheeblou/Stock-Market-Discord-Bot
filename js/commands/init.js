const mysql = require('../util/mysql.js');
const tool = require('../util/tools.js');
const helpCmd = require('./help.js');

exports.run = async (client, msg, args) => {
	const msgBot = await msg.channel.send(tool.createEmbedMessage(msg, 'FF8400', 'Creating account...'));
	const accCreated = await mysql.isAccountCreated(msg.author.id, false, msg);

	if (accCreated) {
		msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', 'You have already initialized your account!'));
	} else {
		await mysql.sql.query('INSERT INTO userdata VALUES(?,?,?,?,?)', [msg.author.id, 100000, '{"trades" : []}', 0, 0],
			(err) => {
				if (err) throw err;
				msgBot.edit(tool.createEmbedMessage(msg, '56C114', 'Your account has been created!'));
				helpCmd.run(client, msg, args);
			});
	}
};

exports.config = {
	name: 'Init',
	category: 'Basics',
	usage: 'init',
	description: 'Initialize your account!',
};

const mysql = require('../util/mysql.js');

exports.run = async (client, msg, args) => {
	if (args === undefined || args.length > 5 || args.length < 1) {
		msg.channel.send('Your prefix is invalid! (Should be between 1 to 5 characters)');
		return;
	} if (msg.guild === null) {
		msg.channel.send("Sorry, you can't do that here.");
		return;
	}

	if (args !== 'sm!') {
		const regexResult = args.match('^[a-zA-Z0-9!?^;:@#€£§$&%()+-=<>~.,/"]*$');
		try {
			if (!(regexResult && regexResult[0] === args)) {
				msg.channel.send('Error! Invalid characters used!');
				return;
			}
			mysql.setPrefixServer(msg.guild.id, args);
		} catch (e) {
			msg.channel.send('An unhandled error occured! Please try again with another prefix');
			console.log(e);
			return;
		}
	} else {
		mysql.sql.query('DELETE FROM prefixserver WHERE id = ?', [msg.guild.id], (err) => { if (err) throw err; });
	}
	msg.channel.send(`My prefix is now \`${args}\` (e.g: \`${args}help\`)`);
};

exports.config = {
	name: 'Prefix',
	category: 'Basics',
	description: 'Change my prefix to the choosen one!',
	usage: 'prefix',
	syntax: '<prefix>',
	guildOnly: true,
	permissions: {
		SERVER_PERMISSIONS: ['MANAGE_GUILD'],
	},
};

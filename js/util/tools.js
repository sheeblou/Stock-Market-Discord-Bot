const discord = require('discord.js');

function createEmbedMessage(msg, color, title, content = [], desc = null, img = null) {
	const embed = new discord.MessageEmbed()
		.setColor(color)
		.setDescription(desc || '')
		.setAuthor(title || '')
		.addFields(content);

	if (img) {
		return embed
			.attachFiles(`img/${img}`)
			.setImage(`attachment://${img}`);
	}

	return embed;
}

function setRightNumFormat(num, floatNum = true) {
	return (Math.abs(num) <= 10 && num !== 0 && floatNum) ? num.toFixed(5) : parseFloat(num.toFixed(2)).toLocaleString('en-US');
}

async function getUser(msg, txt, msgBot = undefined) {
	if (msg.guild) {
		if (txt) {
			const arrTxt = [{
				name: 'Invalid argument',
				value: '',
			}];
			if (txt.substring(0, 3).concat(txt.substring(txt.length - 1, txt.length)) === '<@!>') {
				try {
					return await msg.guild.members.fetch(txt.substring(3, txt.length - 1));
				} catch (e) {
					if (msgBot) {
						arrTxt[0].value = 'Couldn\'t fetch the data of the target! (Is the user on the server?)';
						msgBot.edit(createEmbedMessage(msg, 'FF0000', 'Error!', arrTxt));
					}
				}
			} else if (msgBot) {
				arrTxt[0].value = 'Couldn\'t fetch the data of the target! (You have to mention the user!)';
				msgBot.edit(createEmbedMessage(msg, 'FF0000', 'Error!', arrTxt));
			}
		} else {
			// I know, it sounds intuitive, I could use msg.author
			// But this function gives more information about the user (Only if (s)he is in a server)
			return msg.guild.members.fetch(msg.author.id);
		}
	}
	return msg.author;
}

module.exports = {
	createEmbedMessage,
	setRightNumFormat,
	getUser,
};

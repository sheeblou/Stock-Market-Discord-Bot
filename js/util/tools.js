const discord = require('discord.js');

function createEmbedMessage(msg, color, title, content = [], desc = null,
	img = null, footer = null) {
	let embed = new discord.MessageEmbed()
		.setColor(color)
		.setDescription(desc || '')
		.setAuthor(title || '')
		.addFields(content);

	if (img) {
		embed = embed
			.attachFiles(`img/${img}`)
			.setImage(`attachment://${img}`);
	}
	if (footer) {
		embed = embed
			.setFooter(footer);
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
			let userId = txt;
			if (txt.substring(0, 3).concat(txt.substring(txt.length - 1, txt.length)) === '<@!>') {
				userId = userId.substring(3, txt.length - 1);
			} else if (txt.substring(0, 2).concat(txt.substring(txt.length - 1, txt.length)) === '<@>') {
				userId = userId.substring(2, txt.length - 1);
			}
			try {
				return await msg.guild.members.fetch(userId);
			} catch (e) {
				if (msgBot) {
					arrTxt[0].value = 'Couldn\'t fetch the data of the target! (Is the user on the server? / Did you mention the user?)';
					return msgBot.edit(createEmbedMessage(msg, 'FF0000', 'Error!', arrTxt));
				}
			}
		} else {
			// I know, it sounds intuitive, I could use msg.author
			// But this function gives more information about the user (Only if (s)he is in a server)
			return msg.guild.members.fetch(msg.author.id);
		}
	}
	return msg.author;
}

function getSpecificColumn(arr, index) {
	const result = [];
	arr.forEach((v) => {
		result.push(v[index]);
	});
	return result;
}

async function getTotalServersOnBot(client){
	return client.shard.fetchClientValues('guilds.cache.size')
		.then(results => {
			return results.reduce((acc, guildCount) => acc + guildCount, 0)})
		.catch((err) => {
			console.log(err);
		})
}

async function updateBotStatus(client){
	getTotalServersOnBot(client).then((numServers) =>{
		if(numServers) {
			client.shard.broadcastEval(`if(this.user){this.user.setPresence({activity: {name: \`${numServers} servers! | sm!help\`, type: 'WATCHING', url: 'https://www.twitch.tv/monstercat'}})}`).catch(err => console.log(err))
		}
	});
}

module.exports = {
	createEmbedMessage,
	setRightNumFormat,
	getUser,
	getSpecificColumn,
	getTotalServersOnBot,
	updateBotStatus
};

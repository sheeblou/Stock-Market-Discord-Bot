const { promisify } = require('util');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const Enmap = require('enmap');
const discordjs = require('discord.js');

const client = new discordjs.Client();

client.commands = new Enmap();
client.aliases = new Enmap();
client.events = new Enmap();

async function init() {
	const eventFiles = await readdir('./js/events/');
	eventFiles.forEach((f) => {
		try {
			const event = require(`./events/${f}`);
			const eventName = f.split('.')[0];
			client.on(eventName, event.bind(null, client));
		} catch (e) {
			console.log(`Event ${f} couldn't load, ${e}`);
		}
	});
	recLoadCmds('./js/commands')

	client.login(process.env.BOT_TOKEN);
}

async function recLoadCmds(path){
	const pathReadDir = await readdir(`${path}`)
	const tempPath = "." + path.slice(4); //why
	pathReadDir.forEach((f) => {
		if(fs.statSync(`${path}/${f}`).isDirectory()){
			recLoadCmds(`${path}/${f}`)
		}
		else {
			try {
				const cmd = require(`${tempPath}/${f}`);
				client.commands.set(cmd.config.usage, cmd);
				if (cmd.config.aliases) {
					cmd.config.aliases.forEach((al) => {
						client.aliases.set(al, cmd.config.usage);
					});
				}
			} catch (e) {
				console.log(`Command ${tempPath}/${f} couldn't load, ${e}`);
			}
		}
	});
}

init();

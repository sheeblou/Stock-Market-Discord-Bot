const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");
const client = new (require("discord.js")).Client()

client.config = require("./config.js");
client.commands = new Enmap();
client.aliases = new Enmap();
client.events = new Enmap();

async function init() {
    const cmdFiles = await readdir("./js/commands/")
    const eventFiles = await readdir("./js/events/");

    cmdFiles.forEach(f => {
        try {
            let cmd = require(`./commands/${f}`);
            client.commands.set(cmd.config.usage, cmd)
            if(cmd.config.aliases){
                cmd.config.aliases.forEach(al => {
                    client.aliases.set(al, cmd.config.usage)
                })
            }
            console.log(`Command ${f} loaded!`)
        }
        catch (e) {
            console.log(`Command ${f} couldn't load, ${e}`);
        }
    });

    eventFiles.forEach(f => {
        try {
            let event = require(`./events/${f}`);
            let eventName = f.split(".")[0];
            client.on(eventName, event.bind(null, client));
            console.log(`Event ${f} loaded!`)
        }
        catch (e) {
            console.log(`Event ${f} couldn't load, ${e}`);
        }
    });

    client.login(require("./config.js").token);
}

init();
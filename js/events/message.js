const mysql = require("../util/mysql.js");
const conf = require("../config.js")
const coolDownSet = new Set();


module.exports = async (client, msg) => {
    if(msg.author.bot) return;
    let sMsg = msg.content.split(' ');

    if(msg.guild === null && msg.author.id !== client.user.id && !msg.content.startsWith("sm!")){
        console.log(`DM: ${msg.author.id} - ${msg.content}`);
        client.users.cache.get(conf.ownerID).send(`${msg.author.id} (${msg.author.username}#${msg.author.discriminator}) - ${msg.content}`);
    }

    let idServer = (msg.guild !== null) ? msg.guild.id : "-1";
    mysql.getPrefixServer(idServer).then(r => {
        r = (msg.guild !== null) ? r[0] : "sm!";
        if (msg.content.startsWith(r)) {
            try {
                console.log(`${msg.author.id} - ${msg.content}`);
                const cmd = client.commands.get(sMsg[0].split(r)[1].toLowerCase()) || client.commands.get(client.aliases.get(sMsg[0].split(r)[1].toLowerCase()))
                if (!cmd) { return }
                if(cmd.config.guildOnly && msg.guild === null){
                    return msg.channel.send("You can't use that command in a pm!")
                }
                if(cmd.config.permissions) {
                    if (cmd.config.permissions.BOT_PERMISSIONS === "OWNER" && msg.author.id !== conf.ownerID) {
                        return msg.channel.send("Only the owner of the bot can use this command!")
                    } else if (cmd.config.permissions.SERVER_PERMISSIONS) {
                        let perms = msg.channel.permissionsFor(msg.author.id);
                        if (!perms.has("ADMINISTRATOR") && !perms.has(cmd.config.permissions.SERVER_PERMISSIONS))
                            return msg.channel.send(`You don't have enough permissions! (You need to have \`ADMINISTRATOR\` or \`${cmd.config.permissions.SERVER_PERMISSIONS}\` permission on the server)`);
                    }
                }

                if (coolDownSet.has(msg.author.id)) {
                    msg.channel.send(`Please wait ${conf.cooldown} seconds before using another command!`);
                } else {
                    const args = msg.content.slice(r.length + sMsg[0].split(r)[1].length).trim()
                    cmd.run(client, msg, args);
                    coolDownSet.add(msg.author.id);
                    setTimeout(() => coolDownSet.delete(msg.author.id), conf.cooldown * 1000);
                }

            } catch (e) {
                msg.channel.send("Something went terribly wrong! Please send the following text to Cryx#7291\n" +
                    "```\n" + e + "\n```");
                console.log(e);
            }
        }

        if (msg.content.startsWith(`<@!${client.user.id}>`) || msg.content.startsWith(`<@${client.user.id}>`)) {
            msg.channel.send(`My prefix is **${r}**`)
        }
    });
}
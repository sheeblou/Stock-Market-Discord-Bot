const mysql = require("../util/mysql.js");
const tool = require("../util/tools.js");

exports.run = async (client, msg, args) => {
    let msgBot = await msg.channel.send(tool.createEmbedMessage(msg, "FF8400", "Deleting account..."))

    let accCreated = await mysql.isAccountCreated(msg.author.id, false, msg);
    if (accCreated) {
        await mysql.sql.query("DELETE FROM userdata WHERE id = ?", [msg.author.id],
            function (err) {
                if (err) throw err;
                msgBot.edit(tool.createEmbedMessage(msg, "56C114", "Your account has been deleted! You can recreate one with init"));
            }
        );
    }
    else{
        msgBot.edit(tool.createEmbedMessage(msg, "FF0000", "Huh, I didn't find your account."));
    }
}

exports.config = {
    name: "Delete your account",
    category: "Basics",
    usage: "del",
    description: "Delete your account from the database **(Warning: Your account will be instantly wiped out from the database without any confirmation!)**",
}
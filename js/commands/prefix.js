const mysql = require("../util/mysql.js");

exports.run = async (client, msg, args) => {
    if (args === undefined || args.length > 5 || args.length < 1) {
        msg.channel.send("Your prefix is invalid! (Should be between 1 to 5 characters)");
        return;
    } else if (msg.guild === null) {
        msg.channel.send("Sorry, you can't do that here.");
        return;
    }

    if(args !== "sm!"){
        try{
            //Escape is deprecated, I beg you, don't use it
            mysql.setPrefixServer(msg.guild.id, decodeURIComponent(escape(args)));
        }
        catch (e) {
            msg.channel.send("The prefix asked is not in the right format! (Please use the latin alphabet)");
            return;
        }
    }
    else{
        mysql.sql.query("DELETE FROM prefixserver WHERE id = ?", [msg.guild.id], function(err){if (err) throw err})
    }
    msg.channel.send(`My prefix is now **${args}**`);

}


exports.config = {
    name: "Prefix",
    category: "Basics",
    description: "Change my prefix to the choosen one!",
    usage: "prefix",
    syntax: "<prefix>",
    guildOnly: true,
    permissions: {
        SERVER_PERMISSIONS: ["MANAGE_GUILD"]
    },
}
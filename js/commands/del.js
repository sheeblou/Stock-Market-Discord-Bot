const mysql = require("../util/mysql.js");

exports.run = async (client, msg, args) => {
    let accCreated = await mysql.isAccountCreated(msg.author.id, false, msg);
    if (accCreated) {
        await mysql.sql.query("DELETE FROM userdata WHERE id = ?", [msg.author.id],
            function (err) {
                if (err) throw err;
                msg.channel.send("Your account has been deleted! You can recreate one with **init**");
            }
        );
    }
    else{
        msg.channel.send("Huh, I didn't find your account.");
    }
}

exports.config = {
    name: "Delete your account",
    category: "Basics",
    usage: "del",
    description: "Delete your account from the database **(Warning: Your account will be instantly wiped out from the database without any confirmation!)**",
}
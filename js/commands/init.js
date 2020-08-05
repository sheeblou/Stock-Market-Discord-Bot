const mysql = require("../util/mysql.js");

exports.run = async (client, msg, args) => {
    let accCreated = await mysql.isAccountCreated(msg.author.id, false, msg);
    if (accCreated) {
        msg.channel.send("You have already initialized your account!");
    } else {
        await mysql.sql.query("INSERT INTO userdata VALUES(?,?,?,?)", [msg.author.id, 100000, '{"trades" : []}', 0],
            function (err) {
                if (err) throw err;
                msg.channel.send("Your account has been created!");
                require("./help.js").run(client, msg, args)
            }
        );
    }
}

exports.config = {
    name: "Init",
    category: "Basics",
    usage: "init",
    description: "Initialize your account!",
}
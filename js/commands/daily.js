const mysql = require("../util/mysql.js");
const tool = require("../util/tools.js");

exports.run = async (client, msg, args) => {
    if (await mysql.isAccountCreated(msg.author.id, true, msg)) {
        let data = await mysql.getUserData(msg.author.id, ["dailytime", "money"]);
        let dailyTime = data[0]["dailytime"];
        let money = data[0]["money"];

        let dateNow = Math.round(Date.now() / 1000);
        let delay = parseInt(dailyTime) - dateNow;

        if (delay < 0) {
            let newBalance = money + 2500;
            let newDailyTime = dateNow + 86400;

            await mysql.sql.query("UPDATE userdata SET money = ?, dailytime = ? WHERE id = ?", [newBalance, newDailyTime, msg.author.id], function(err){if (err) throw err});
            msg.channel.send(tool.createEmbedMessage(msg, "56C114", "Your daily reward!", [{
                name: `You have received your daily reward!`,
                value: `Thank you for your fidelity, you have received $2,500!`
            }
            ]));
        } else {
            let h = "0" + parseInt(delay / 3600);
            let m = "0" + parseInt(delay % 3600 / 60);
            let s = "0" + parseInt(delay % 60);

            msg.channel.send(tool.createEmbedMessage(msg, "FF0000", "Your daily reward!",
                [{
                    name: `Be patient !`,
                    value: `Please wait **${h.toString().substr(-2)}h${m.toString().substr(-2)}m${s.toString().substr(-2)}s** and try again.`
                }]));
        }
    }
}

exports.config = {
    name: "Daily",
    category: "Player Account",
    description: "To get your daily reward",
    usage: "daily",
}
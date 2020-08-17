const mysql = require("../util/mysql.js");
const tool = require("../util/tools.js");
const auth = require("../config.js")
const DBL = require("dblapi.js");
let dbl;


exports.run = async (client, msg) => {
    if(!(await mysql.isAccountCreated(msg.author.id, true, msg))){
        return;
    }
    if(!dbl){
        dbl = new DBL(auth.topgg_token, client);
    }
    let data = await mysql.getUserData(msg.author.id, ["votetime", "money"]);
    let voteTime = data[0]["votetime"];
    let money = data[0]["money"];
    let dateNow = Math.round(Date.now() / 1000);
    let delay = parseInt(voteTime) - dateNow;

    if(delay < 0){
        dbl.hasVoted(msg.author.id).then(voted => {
            if(voted){
                console.log("Someone has voted for the bot!")
                let newBalance = money + 2500;
                let newVoteTime = dateNow + 43200;
                mysql.sql.query("UPDATE userdata SET money = ?, votetime = ? WHERE id = ?", [newBalance, newVoteTime, msg.author.id], function(err){if (err) throw err})
                msg.channel.send(tool.createEmbedMessage(msg, "56C114", "Vote for the bot!", [{
                    name: `You have received your reward!`,
                    value: `Thank you for your vote, you have received $2,500!`
                }]));
            }
            else{
                msg.channel.send(tool.createEmbedMessage(msg, "008CFF", "Vote for the bot!", [
                    {
                        name: "You need to vote first to get the reward!",
                        value: "[Vote here](https://top.gg/bot/700690470891814912/vote)"
                    },
                    {
                        name: "Reward",
                        value: "Use this command after you have voted to claim your reward! (Might take a few minutes to register your vote)",
                    }
                ]))
            }
        }).catch((err) => {
            msg.channel.send("An error occurred with the service. I can't verify your vote! Please try later.")
            console.error(`ERROR: Couldn't check the vote of ${msg.author.id}! ${err}`)
        });

    } else {
        let h = "0" + parseInt(delay / 3600);
        let m = "0" + parseInt(delay % 3600 / 60);
        let s = "0" + parseInt(delay % 60);

        msg.channel.send(tool.createEmbedMessage(msg, "FF0000", "Vote for the bot!",
            [{
                name: `Be patient !`,
                value: `Please wait **${h.toString().substr(-2)}h${m.toString().substr(-2)}m${s.toString().substr(-2)}s** and try again.`
            }]));
    }
}

exports.config = {
    name: "Vote",
    category: "Basics",
    usage: "vote",
    description: "Get an extra $2,500 by voting for the bot!",
}
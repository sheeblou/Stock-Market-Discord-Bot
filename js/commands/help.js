const tool = require("../util/tools.js");

exports.run = (client, msg, args) => {
    if(args){
        const cmd = client.commands.get(args.toLowerCase()) || client.commands.get(client.aliases.get(args.toLowerCase()))
        if(cmd){
            return msg.channel.send(tool.createEmbedMessage(msg, "008CFF", cmd.config.name,
                [
                    {
                        name: "Description",
                        value: cmd.config.description
                    },
                    {
                        name: "Usage",
                        value: `${cmd.config.usage} ${cmd.config.syntax || ""}`
                    },
                    {
                        name: "Aliases",
                        value: `${cmd.config.aliases || "None"}`
                    }
                ]
            ));
        }
    }

    msg.channel.send(tool.createEmbedMessage(msg, "008CFF", "Help!",
        [
            {
                name: "*Basics*",
                value: "`help` You're here \n`init` The command to get started \n`del` Delete your account from the database (__Warning: Your account will be instantly wiped out from the database without any confirmation!__)\n`prefix <prefix>` Change my prefix to the choosen one! \n*Note: Mention me with `prefix` to know my prefix! (@Stock Market prefix)*\n`ping` To see the latency between you, the bot and the API\n`about` About the bot\n"
            },
            {
                name: "*Player account*",
                value: "`balance` / `balance @User` To admire your / user's wealth\n`list` / `list @User` Your / user's current trades\n`daily` To get your daily reward\n`vote` Vote for the bot and get a reward\n\n"
            },
            {
                name: "*Stock Market* ",
                value: "`search` To search for stock markets\n`show <symbol>` To get details about a particular market (ex: *sm!show AAPL*)\n`newtrade <buy/sell> <symbol> <price>` To trade stocks on the market(ex: *sm!newtrade buy AAPL 5000*)\n==>`buy` if you think the stock will go up, \n==>`sell` if you think the stock will go down.\n`closetrade <ID>` (ex: *sm!closetrade 0*) Close a trade (the ID can be found with the `list` command). Give to you the final value of your trade."
            },
            {
                name: "*Available aliases*",
                value: "Type `help <command>`\n"
            },
            {
                name: "*Okay, how do I play?* ",
                value: "First, you are going to look for a market. Type `sm!search`, it will redirect you to a website.\nThen type `sm!show <symbol>` if you want more details about it.\nNow it's time to trade! Follow the instructions above for `newtrade` and `closetrade`!\n***The symbol is not the name, but may look like this: TSLA, AAPL, MSFT... ***\nHappy trading!"
            }
        ]
    )).catch((e) => {
        if(e.message === "Missing Permissions"){
            msg.author.send("I can't send any messages in this channel! Please give me the needed permissions to send messages!");
        }
    });
}


exports.config = {
    name: "Help!",
    category: "Basics",
    usage: "help",
    description: "You're here",
}
# Stock market bot
A bot to "play" with the stock market by using fake money.
The data is provided by [tradingview](https://www.tradingview.com) through the library [tradingview-scraper](https://github.com/imxeno/tradingview-scraper).

## Node.js dependencies
List available [here](https://github.com/cryx3001/Stock-Market-Discord-Bot/network/dependencies).

## Available commands
Prefix by default: `sm!`
### Basics
- `help` Gives you the help you need!
- `init` The command to get started
- `del` Delete your account from the database (__Warning: Your account will be instantly wiped out from the database without any confirmation!__)
- `prefix <prefix>` Change my prefix to the choosen one!
*Note: Mention me with `prefix` to know my prefix! (@Stock Market prefix)*
- `ping` To see the latency between you, the bot and the API
- `about` About the bot

### Player account
- `balance` / `balance @User` To admire your / user's wealth
- `list` / `list @User` Your / user's current trades
- `daily` To get your daily reward
- `vote` Vote for the bot and get a reward

### Stock Market
- `search` To search for stock markets
- `show <symbol>` To get details about a particular market (ex: *sm!show AAPL*)
- `newtrade <buy/sell> <symbol> <price>` To trade stocks on the market(ex: *sm!newtrade buy AAPL 5000*)
- ==>`buy` if you think the stock will go up,
- ==>`sell` if you think the stock will go down.
- `closetrade <ID>` (ex: *sm!closetrade 0*) Close a trade (the ID can be found with the list command). Give to you the final value of your trade.

### Available aliases
Type `help <command>`

### Okay, how do I play?
First, you are going to look for a market. Type `sm!search`, it will redirect you to a website.
Then type `sm!show <symbol>` if you want more details about it.
Now it's time to trade! Follow the instructions above for `newtrade` and `closetrade`!
Happy trading!


## Test it!
You can invite the bot on your Discord server [here](https://discordapp.com/oauth2/authorize?client_id=700690470891814912&permissions=3072&scope=bot). Type `sm!help` to get started!
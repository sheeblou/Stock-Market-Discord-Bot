# Stock Market Bot
It is a bot to "play" with the stock market by using fake money ! It also supports cryptocurrencies.
The data is provided by [tradingview](https://www.tradingview.com) through the library [tradingview-scraper](https://github.com/imxeno/tradingview-scraper).

## Available commands
Prefix by default: `sm!`
### Basics
- `help` Gives you the help you need!
- `init <amount>` The command to get started (0 < `amount` =< 100000)
- `del` Delete your account from the database <br />
  (__Warning: Your account will be instantly wiped out from the database without any confirmation!__)
- `prefix <prefix>` Change my prefix to the choosen one! <br />
  *Note: Mention me with `prefix` to know my prefix! (@Stock Market prefix)*
- `ping` To see the latency between you, the bot and the API
- `about` About the bot

### Player account
- `balance` / `balance @User` To admire your / user's wealth
- `list` / `list @User` Your / user's current trades
- `daily` To get your daily reward
- `vote` Vote for the bot and get a reward
- `leaderboard` Who is the richest in your server?

### Stock Market
- `search` To search for stock markets
- `show <symbol>` To get details about a particular market (ex: `sm!show AAPL`)
- `newtrade <buy/sell> <symbol> <price> <optional: share/s>` To trade stocks on the market(ex: `sm!newtrade buy AAPL 5000`) <br />
  &nbsp; ==>`buy` if you think the stock will go up, <br />
  &nbsp; ==>`sell` if you think the stock will go down. <br />
  Adding "s" or "share" at the end of the command will specify an amount of shares to buy/sell  <br />
  (ex: `sm!newtrade buy BTCUSD 1 s` will buy the value of 1 Bitcoin) <br />
- `closetrade <ID>` (ex: *sm!closetrade 0*) Close a trade (the ID can be found with the list command). Give to you the worth of your trade.

### Available aliases
Type `help <command>`

### Okay, how do I play?
First, you are going to look for a market. Type `sm!search`, it will redirect you to a website.
Then type `sm!show <symbol>` if you want more details about it.
Now it's time to trade! Follow the instructions above for `newtrade` and `closetrade`!
Happy trading!

### Can I run this code on my bot?
- Yup! Please fill the missing fields in `config/blank.env` and rename it to `config/prod.env`. (Free MySQL databases can be found on https://www.alwaysdata.com)
- `npm` and `nodejs` latest versions should be installed.
- Run `npm install` in the root directory to install the necessary modules.
- Run `./js/app.js`

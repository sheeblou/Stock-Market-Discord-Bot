let sql = require('mysql');
const smarket = require('./stockmarket.js');
const tool = require('./tools.js');

sql = sql.createConnection({
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASS
});

function getUserData(userId, value = ['*']) {
	return new Promise((resolve, reject) => {
		sql.query(`SELECT ${value} FROM userdata WHERE id = ?`, [userId],
			(err, result) => {
				if (err) {
					reject(err);
					throw err;
				}
				resolve(result);
			});
	});
}

async function updateMoney(msg, userID, num, isAdding = true) {
	let money = await getUserData(userID, 'money');
	money = Math.max(0, isAdding === true ? money[0].money + num : num);
	sql.query('UPDATE userdata SET money = ? WHERE id = ?', [money, userID], (err) => { if (err) throw err; });
}

async function getTradeList(msg, userId = msg.author.id, value = null, prelist = null) {
	try {
		let list = prelist || await getUserData(userId, 'trades');
		list = list[0].trades;
		list = JSON.parse(list).trades;
		return (Number.isInteger(value)) ? list.find((elem) => elem.id === value) : list;
	} catch (e) {
		console.log(e);
	}
	return [];
}

async function updateList(msg, status, edit = []) {
	let list = await getTradeList(msg);
	if (!list) {
		msg.channel.send(tool.createEmbedMessage(msg, 'FF0000', 'Something went terribly wrong! Please try again or contact the support.'));
		return;
	}

	if (status === 'del') {
		list = list.filter((elem) => !edit.includes(elem.id));
	} else if (status === 'add') {
		let setNum = 0;
		for (let i = 0; list.find((elem) => elem.id === i); i++) {
			setNum = i + 1;
		}

		const elemToAdd = {
			id: setNum,
			symbol: edit[0],
			status: edit[1],
			volume: edit[2],
			haspaid: edit[3],
		};

		list.push(elemToAdd);
	}

	list = { trades: list };
	sql.query('UPDATE userdata SET trades = ? WHERE id = ?', [JSON.stringify(list), msg.author.id], (err) => { if (err) throw err; });
}

async function isAccountCreated(userId, autoMessage = false, msg, msgBot = null) {
	return new Promise(((resolve, reject) => {
		sql.query('SELECT id FROM userdata WHERE id = ?', [userId],
			(err, result) => {
				if (err) reject(err);

				const isCreated = (result[0] !== undefined);
				if (!isCreated && autoMessage) {
					const errMsg = (userId === msg.author.id) ? 'You don\'t have any account! Please create one with the command: init' : "This member doesn't have any account!";
					if (!msgBot) {
						msg.channel.send(tool.createEmbedMessage(msg, 'FF0000', errMsg));
					} else {
						msgBot.edit(tool.createEmbedMessage(msg, 'FF0000', errMsg));
					}
				}
				return resolve(isCreated);
			});
	}));
}

async function isMarketLimited(symb) {
	return new Promise(((resolve, reject) => {
		sql.query('SELECT markets FROM limited_markets WHERE markets = ?', [symb.toUpperCase()],
			(err, result) => {
				if (err) reject(err);
				return resolve(result[0] !== undefined);
			});
	}));
}

function getPrefixServer(serverId) {
	return new Promise((resolve, reject) => {
		if (serverId === '-1') resolve(['sm!', false]);

		sql.query('SELECT prefix FROM prefixserver WHERE id = ?', [serverId],
			(err, result) => {
				if (err) {
					reject(err);
					throw err;
				}
				if (result[0] !== undefined) {
					resolve([result[0].prefix, true]);
				}
				resolve(['sm!', false]);
			});
	});
}

async function setPrefixServer(serverId, prefix) {
	const r = await getPrefixServer(serverId);
	if (!r[1]) {
		sql.query('INSERT INTO prefixserver VALUES(?,?)', [serverId, prefix], (err) => { if (err) throw err; });
	} else {
		sql.query('UPDATE prefixserver SET prefix = ? WHERE id = ?', [prefix, serverId], (err) => { if (err) throw err; });
	}
}

async function getTradeInfo(list, msg) {
	const arrSymb = [];
	const arrTrade = [];

	if (!list[0]) {
		return ['-1'];
	}

	for (let i = 0; i < list.length; i++) {
		arrSymb.push(list[i].symbol);
	}
	const resp = await smarket.getStockData(arrSymb);
	try {
		list.forEach((elem) => {
			const market = resp.find((e) => elem.symbol.toUpperCase() === e.symbol || elem.symbol.toUpperCase().split(':')[1] === e.symbol);
			if (!market) {
				msg.channel.send(`Something went terribly wrong while fetching the data of **${elem.symbol}** (ID: **${elem.id}**)! Please try again or contact the support`);
			} else {
				const isValid = (market.price !== undefined);
				arrTrade.push(
					{
						id: elem.id,
						name: isValid ? market.name : 'REQUEST FAILED, RETRY LATER',
						symbol: isValid ? elem.symbol : 'API ERROR',
						volume: elem.volume,
						status: elem.status,
						haspaid: parseFloat(elem.haspaid),
						price: market.price,
						session: market.session,
						update: market.update,
					},
				);
			}
		});
	} catch (e) {
		msg.channel.send(`Something went terribly wrong! Please try later.\n\`\`\`\n${e}\n\`\`\``);
		console.error(e);
	}

	const arrResult = [];
	let sumTrades = 0;
	let sumProfit = 0;
	for (let i = 0; i < arrTrade.length; i++) {
		try {
			let worthTrade = arrTrade[i].price * arrTrade[i].volume;
			let profit = worthTrade - arrTrade[i].haspaid;
			const shownWorthTrade = worthTrade;

			if (arrTrade[i].status === 'sell') {
				profit *= -1;
				worthTrade = profit + arrTrade[i].haspaid;
				// = -arrTrade[i].price * arrTrade[i].volume + arrTrade[i].haspaid * 2
			}
			sumTrades += worthTrade || 0;
			sumProfit += profit || 0;

			const percentage = (profit / arrTrade[i].haspaid) * 100;

			arrResult.push(
				{
					name: arrTrade[i].name,
					symbol: arrTrade[i].symbol,
					status: arrTrade[i].status,
					id: arrTrade[i].id,
					volume: arrTrade[i].volume,
					haspaid: arrTrade[i].haspaid,
					worthTrade,
					profit,
					profitPercentage: percentage,
					shownWorthTrade,
					session: arrTrade[i].session,
					update: arrTrade[i].update,
				},
			);
		} catch (e) {
			console.log(e);
		}
	}
	return [arrResult, sumTrades, sumProfit];
}


async function postStats(client){
	const dateNow = Math.round(Date.now() / 1000);
	const totalServers = await tool.getTotalServersOnBot(client);
	sql.query('SELECT SUM(money), COUNT(*) FROM userdata WHERE money<1000000000000', (err, result) => {
		sql.query(
			'INSERT INTO stats_bot VALUES(?,?,?,?)',
			[dateNow, totalServers, result[0]['COUNT(*)'] || -1, result[0]['SUM(money)']  || -1],
			(err) => {console.log(err)});
	});
}

module.exports = {
	getUserData,
	isAccountCreated,
	getTradeList,
	updateList,
	getTradeInfo,
	updateMoney,
	getPrefixServer,
	setPrefixServer,
	isMarketLimited,
	postStats,
	sql,
};

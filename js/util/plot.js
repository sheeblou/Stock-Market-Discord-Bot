const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');
const plotly = require('plotly');
const auth = require('../config.js');

const readdir = promisify(fs.readdir);
const plotOpt = {
	format: 'png',
	width: '1000',
	height: '500',
	filename: 'discordBot',
	world_readable: false,
	fileopt: 'overwrite',
};

async function getCandlesData(tag) {
	if (!tag) return;

	const nowTimestamp = parseInt(Date.now() / 1000, 10);
	const monthTimestamp = parseInt(nowTimestamp - 5356800, 10);
	const request = `candle?symbol=${tag.toUpperCase()}&resolution=D&from=${monthTimestamp}&to=${nowTimestamp}&token=${auth.finnhubToken}`;

	return new Promise((resolve, reject) => {
		axios.get(`https://finnhub.io/api/v1/stock/${request}`).then((arr) => {
			if (arr.data.s) {
				if (arr.data.s === 'ok') {
					resolve(arr.data);
				} else {
					resolve();
				}
			} else resolve();
		}).catch((e) => {
			reject(e);
		});
	});
}

function getChart(tag, msg) {
	return new Promise((resolve, reject) => {
		getCandlesData(tag).then((r) => {
			const arr = r;
			arr.t.forEach((v, k) => {
				const tempDate = new Date(r.t[k] * 1000);
				arr.t[k] = `${parseInt(tempDate.getDate(), 10)}-${tempDate.getMonth()}-${tempDate.getFullYear()}`;
			});
			const date = arr.t;
			const close = arr.c;
			const data = {
				data: [{
					x: date,
					y: close,
					type: 'scatter',
					mode: 'lines+markers',
					title: `${tag}'s chart`,
				}],
			};

			plotly(auth.plotlyUser, auth.plotlyToken).getImage(data, plotOpt, (err, imageStream) => {
				try{
					if (err) {
						reject(err);
					}
					const filestream = fs.createWriteStream(`./img/${msg.id}.png`);
					imageStream.pipe(filestream);
					filestream.on('error', reject);
					filestream.on('finish', resolve);
				}
				catch (e) {
					reject(e)
				}

			});
		}).catch((e) => {
			reject(e);
		});
	});
}

async function deleteCharts() {
	const dir = await readdir('./img/');
	dir.forEach((file) => {
		if (file === 'example.png') return;
		fs.unlink(`img/${file}`, (err) => {
			if (err) throw err;
		});
	});
}

module.exports = {
	getChart,
	deleteCharts,
};

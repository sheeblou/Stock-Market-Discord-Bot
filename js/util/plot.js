const auth = require('../config.js');
const axios = require("axios");
const plotly = require('plotly')(auth.plotly_user, auth.plotly_token);
const fs = require('fs');
const { promisify } = require("util");
const readdir = promisify(fs.readdir);
const plot_opt = {
    format: 'png',
    width: '1000',
    height: '500',
    filename: "discordBot",
    world_readable: false,
    fileopt: "overwrite",
};


async function getCandlesData(tag){
    if(!tag) return;

    const nowTimestamp = parseInt(Date.now() / 1000);
    const monthTimestamp = parseInt(nowTimestamp - 5356800);
    const request = `candle?symbol=${tag.toUpperCase()}&resolution=D&from=${monthTimestamp}&to=${nowTimestamp}&token=${auth.finnhub_token}`;

    return new Promise((resolve, reject) => {
        axios.get(`https://finnhub.io/api/v1/stock/${request}`).then((arr) => {
            if(arr.data.s){
                if(arr.data.s === 'ok'){
                    resolve(arr.data);
                }
                else {
                    reject(arr.data);
                }
            }
            else(reject('{s: "No status"}'));
        }).catch((e) =>{
            reject(`{s: "Error while fetching data! ${e}"}`);
        })
    })
}

function getChart(tag, msg) {
    return new Promise((resolve, reject) => {
        getCandlesData(tag).then((r) => {
            r.t.forEach((v, k) => {
                let tempDate = new Date(r.t[k]*1000);
                r.t[k] = `${parseInt(tempDate.getDate())}-${tempDate.getMonth()}-${tempDate.getFullYear()}`
            })
            const date = r.t;
            const close = r.c;
            const data = {
                "data": [{
                    x: date,
                    y: close,
                    type: "scatter",
                    mode: "lines+markers",
                    title: `${tag}'s chart`
                }]
            };

            plotly.getImage(data, plot_opt, function (err, imageStream) {
                if (err) return console.log(err);
                let filestream = fs.createWriteStream(`./img/${msg.id}.png`);
                imageStream.pipe(filestream);
                filestream.on('error', reject);
                filestream.on('finish', resolve);
            })

        }).catch((e) => {
            if(e.s !== 'no_data') {
                console.log(e);
            }
            reject();
        })
    });
}


async function deleteCharts() {
    const dir = await readdir("./img/");
    dir.forEach(file => {
        fs.unlink(`img/${file}`, function (err) {
            if (err) throw err;
        })
    })
}

module.exports = {
    getChart : getChart,
    deleteCharts : deleteCharts,
};
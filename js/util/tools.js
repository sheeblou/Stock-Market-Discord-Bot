const discord = require('discord.js');

function createEmbedMessage(msg, color, title, content = [], desc = null, img = null) {
    let fields = [];
    content.forEach(e => fields.push(e));

    let embed = new discord.MessageEmbed()
        .setColor(color)
        .setDescription(desc || "")
        .setAuthor(title || "")
        .addFields(fields)

    if (img) {
        return embed
            .attachFiles(`img/${img}`)
            .setImage(`attachment://${img}`);
    }

    return embed
}


function setRightNumFormat(num, floatNum = true) {
    return (Math.abs(num) <= 10 && num !== 0 && floatNum) ? num.toFixed(5) : parseFloat(num.toFixed(2)).toLocaleString();
}


function getUserId(msg, txt) {
    txt = txt.split(" ")[1];

    if (txt && txt.substring(0, 3).concat(txt.substring(txt.length - 1, txt.length)) === "<@!>") {
        return txt.substring(3, txt.length - 1)
    }

    return msg.author.id;
}

module.exports = {
    createEmbedMessage: createEmbedMessage,
    setRightNumFormat: setRightNumFormat,
    getUserId: getUserId,
};
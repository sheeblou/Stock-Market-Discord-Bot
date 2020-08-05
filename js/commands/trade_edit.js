exports.run = async (client, msg, args) => {}

exports.config = {
    name: "Trade edit",
    category: "Admin",
    usage: "trade_edit",
    aliases: ["te"],
    description: "Edit the trades of someone",
    guildOnly: false,
    permissions: {
        BOT_PERMISSIONS: ["OWNER"]
    }
}
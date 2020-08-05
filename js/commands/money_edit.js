exports.run = (client, msg, args) => {}

exports.config = {
    name: "Money edit",
    category: "Admin",
    usage: "money_edit",
    aliases: ["me"],
    description: "Edit the balance of someone",
    guildOnly: false,
    permissions: {
        BOT_PERMISSIONS: ["OWNER"]
    }
}
const {ShardingManager} = require('discord.js');
const config = require('./config.js')
const manager = new ShardingManager('./js/bot.js',
    {
        token: config.token,
        totalShards: config.numShards,
        respawn: true,
    });


manager.on('shardCreate', shard => {
    console.log(`Launched shard ${shard.id}`)
})
manager.spawn();

const {ShardingManager} = require('discord.js');
const pathEnv = (process.env.npm_lifecycle_event === 'dev') ?
    'config/dev.env' :
    'config/prod.env';
require('dotenv').config({path:pathEnv})
const manager = new ShardingManager('./js/bot.js',
    {
        token: process.env.BOT_TOKEN,
        totalShards: process.env.BOT_NUMSHARDS | 0,
        respawn: true,
    });

manager.on('shardCreate', shard => {
    console.log(`Launched shard ${shard.id}`)
})
manager.spawn(this.totalShards, 10000, -1);

function killEveryShards(){
    try{
        manager.shards.forEach(shard => {shard.kill()})
    }
    catch (e){
        console.log(e);
    }
}
process.on("exit", killEveryShards);

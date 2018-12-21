console.log('Loading');

const fs = require('fs');
const Discord = require('discord.io');

/*  _auth.json:
    {
        "token": "<<<DISCORD_BOT_TOKEN_HERE>>>"
    }
*/
const auth = require('./_auth.json');

const cmds = require('./cmds.js')
console.log(`Loaded ${Object.keys(cmds.commands).length} commands.`);

const bot = new Discord.Client({
    token: auth.token,
    autorun: true,
});

bot.setPresence({
    game: {
        name: 'with your mom! ROASTED!',
    },
});

bot.on('ready', function(e) {
    console.log('Connected');
    console.log(`Logged in as ${bot.username} (${bot.id})`);
});

bot.on('message', (user, userId, channelId, message, e) => {
    message = message.trim();
    if (message.substring(0, 2) === '//') {
        cmds.onCommand(bot, user, userId, channelId,
                message.substring(2), e);
    }
});

console.log('Registered event handlers');

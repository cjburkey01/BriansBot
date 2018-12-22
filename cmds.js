const request = require('request').defaults({ encoding: null });
const imgur = require('imgur');

const auth = require('./_auth.json');
imgur.setClientId(auth.imgur);

const commands = {
    'ping': {
        description: 'Send and receive a test message from **BriansBot**',
        parameters: {
            required: 0,
            possible: [],
        },
        callback: (bot, user, userId, channelId, cmd, e, arguments) => {
            msg(bot, channelId, `Dearest ${user}: Pong!`);
        },
    },
    'credits': {
        description: 'View credits for the creation of **BriansBot**',
        parameters: {
            required: 0,
            possible: [],
        },
        callback: (bot, user, userId, channelId, cmd, e, arguments) => {
            msg(bot, channelId, 'Created with love by CJ Burkey using the '
                    + 'Discord.io and Imgur node modules');
        },
    },
    'imgur': {
        description: 'Search for an image via the Imgur API using the supplied '
                + 'search term(s)',
        parameters: {
            required: 1,
            possible: [
                'Search Term Including Spaces',
            ],
            unlimited: true,
        },
        callback: (bot, user, userId, channelId, cmd, e, arguments) => {
            let query = arguments.join(' ');
            let options = {
                sort: 'top',
                dateRange: 'all',
                page: 1,
            };
            msg(bot, channelId, 'Retrieving images...',
                    (bot, channelId, msg, msgId) => {
                imgur.search(query, options).then(data => {
                    if (!data || !data.hasOwnProperty('data') || !data.data ||
                            data.data.length < 1 || !data.data[0].link) {
                        bot.editMessage({
                            channelID: channelId,
                            messageID: msgId,
                            message: `No images received from imgur with the `
                                    + `search query of \` ${query} \``,
                        });
                    } else {
                        bot.editMessage({
                            channelID: channelId,
                            messageID: msgId,
                            message: data.data[0].link,
                        });
                    }
                }).catch(error => {
                    console.error(`Failed to request from ImgurAPI: ${error}`);
                    bot.editMessage({
                        channelID: channelId,
                        messageID: msgId,
                        message: 'An error occurred while requesting an image '
                                + 'from the ImgurAPI, please try again later.',
                    });
                });
            });
        },
    },
    'pornhub': {
        description: 'Search via the PornHub API',
        parameters: {
            required: 1,
            possible: [
                'Search Term Including Spaces',
            ],
            unlimited: true,
        },
        callback: (bot, user, userId, channelId, cmd, e, arguments) => {
            let j = arguments.join(' ');
            msg(bot, channelId, 'Loading video search results...',
                    (bot, channelId, msg, msgId) => {
                request(`http://www.pornhub.com/webmasters/search`
                            + `?search=${encodeURI(j)}`
                            + `&ordering=featured`
                            + `&thumbsize=large_hd`, (error, response, body) => {
                    if (error) {
                        bot.editMessage({
                            channelID: channelId,
                            messageID: msgId,
                            message: 'An error occurred while accessing the '
                                    + 'PornHub API',
                        });
                    } else {
                        let data = JSON.parse(body.toString());
                        if (!data || !data.hasOwnProperty('videos')
                                || !data.videos || data.videos.length < 1
                                || !data.videos[0].url) {
                            bot.editMessage({
                                channelID: channelId,
                                messageID: msgId,
                                message: 'No videos found with those search '
                                        + 'terms. Please try again with a '
                                        + 'more general query.',
                            });
                        } else {
                            bot.deleteMessage({
                                channelID: channelId,
                                messageID: msgId,
                            });
                            bot.sendMessage({
                                to: channelId,
                                embed: {
                                    title: `Pornhub: "${data.videos[0].title}"`,
                                    description: data.videos[0].description,
                                    image: {
                                        url: data.videos[0].thumb,
                                    },
                                    url: data.videos[0].url,
                                },
                            });
                        }
                    }
                });
            });
        },
    },
    'pornhubstar': {
        description: 'Search pornstars\' videos via the PornHub API',
        parameters: {
            required: 1,
            possible: [
                'Name Including Spaces',
            ],
            unlimited: true,
        },
        callback: (bot, user, userId, channelId, cmd, e, arguments) => {
            let j = arguments.join(' ');
            msg(bot, channelId, 'Loading pornstar videos...',
                    (bot, channelId, msg, msgId) => {
                request(`http://www.pornhub.com/webmasters/search`
                            + `?stars[]=${encodeURI(j)}`
                            + `&ordering=featured`
                            + `&thumbsize=large_hd`, (error, response, body) => {
                    if (error) {
                        bot.editMessage({
                            channelID: channelId,
                            messageID: msgId,
                            message: 'An error occurred while accessing the '
                                    + 'PornHub API',
                        });
                    } else {
                        let data = JSON.parse(body.toString());
                        if (!data || !data.hasOwnProperty('videos')
                                || !data.videos || data.videos.length < 1
                                || !data.videos[0].url) {
                            bot.editMessage({
                                channelID: channelId,
                                messageID: msgId,
                                message: 'No videos found with that pornstar'
                                        + '. Please try again with a more '
                                        + 'general query.',
                            });
                        } else {
                            bot.deleteMessage({
                                channelID: channelId,
                                messageID: msgId,
                            });
                            bot.sendMessage({
                                to: channelId,
                                embed: {
                                    title: `Pornhub: "${data.videos[0].title}"`,
                                    description: data.videos[0].description,
                                    image: {
                                        url: data.videos[0].thumb,
                                    },
                                    url: data.videos[0].url,
                                },
                            });
                        }
                    }
                });
            });
        },
    },
    'help': {
        description: 'View all commands or find more information about '
                + 'the supplied command',
        parameters: {
            required: 0,
            possible: [
                'Command',
            ],
        },
        callback: (bot, user, userId, channelId, cmd, e, arguments) => {
            if (arguments.length === 0) {
                let output = 'Here is a handy-dandy list of all commands '
                        + 'currently implemented for **BriansBot**:\n';
                Object.keys(commands).forEach(commandName => {
                    output += `- \` ${getUsageString(commandName)} \`\n`;
                });
                output += 'All commands are prefixed by the double slash: '
                        + '\` // \`';
                msg(bot, channelId, output);
            } else {
                if (!commands[arguments[0]]) {
                    msgInvalidCommand(bot, channelId, arguments[0]);
                    return;
                }
                let output = `Command: \` ${arguments[0]} \`:\n    `
                        + `Usage: \` //${getUsageString(arguments[0])} \`\n    `
                        + `${commands[arguments[0]].description}`;
                msg(bot, channelId, output);
            }
        },
    },
};

function onCommand(bot, user, userId, channelId, cmd, e) {
    // Split input command of format: `ping \"This is an example!\"`
    // Into tokens of format: [`ping`, `"This is an example!"`]
    let tokens = cmd.match(/\\?.|^$/g).reduce((p, c) => {
        if(c === '"') {
            p.quote ^= 1;
        } else if (!p.quote && c === ' ') {
            p.tokens.push('');
        } else {
            p.tokens[p.tokens.length-1] += c.replace(/\\(.)/,"$1");
        }
        return p;
    }, {tokens: ['']}).tokens;
    if (tokens.length < 1) {
        return;
    }
    
    // Try to find the matching command
    let invalidCommand = true;
    Object.keys(commands).forEach(commandName => {
        if (commandName.toLowerCase() === tokens[0].toLowerCase()) {
            invalidCommand = false;
            let arguments = tokens.slice(1);
            if (verifyCommandArgs(commands[commandName], arguments)) {
                commands[commandName].callback(bot, user, userId, channelId,
                        cmd, e, arguments);
            } else {
                msg(bot, channelId, `Incorrect arguments provided.\n`
                        + `Usage: \` //${getUsageString(commandName)} \``)
            }
            return;
        }
    });
    if (invalidCommand) {
        msgInvalidCommand(bot, channelId, tokens[0]);
    }
}

function getUsageString(command) {
    let i = 0;
    let output = `${command} `;
    commands[command].parameters.possible.forEach(parameter => {
        let req = i < commands[command].parameters.required;
        output += `${req ? '<' : '['}${parameter}${req ? '>' : ']'} `;
        i++;
    });
    return output.substring(0, output.length - 1);
}

function verifyCommandArgs(command, arguments) {
    return ((arguments.length >= command.parameters.required)
            && ((arguments.length <= command.parameters.possible.length)
                    || ((command.parameters.hasOwnProperty('unlimited'))
                            && (command.parameters.unlimited))));
}

function msgInvalidCommand(bot, channelId, command) {
    msg(bot, channelId, `Invalid command: \` //${command} \`\n`
            + `Use \` //help \` to see a list of valid commands.`);
}

function msg(bot, channelId, message,
        callback = ((bot, channelId, msg, msgId) => {})) {
    bot.sendMessage({
        to: channelId,
        message: message,
    }, (error, response) => {
        callback(bot, channelId, msg, response.id);
    });
}

module.exports = {
    'commands': commands,
    'onCommand': onCommand,
};

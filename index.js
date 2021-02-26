const discord = require('discord.js');
const client = new discord.Client();
require('dotenv').config();
client.login(process.env.TOKEN);

let points = require('./points');
const fs = require('fs');

const cooldown = new Set();

client.on('message', msg => {
    if (!msg.guild || msg.author.id == client.user.id) return;
    let args = msg.content.toLowerCase().split(" ");
    if (args.length < 2 || args.length > 3) return;

    const cmd = args[0];
    let user = msg.mentions.members.first();
    if (!user) {
        return;
    }

    let funnyValue = null;
    switch (cmd) {
        case "funny":
            if (user.user.id == msg.author.id) {
                return msg.reply("You can't give yourself funny points.");
            }
            else if (user.user.id == client.user.id) {
                return msg.reply("You can't give me funny points.");
            }

            if (cooldownCheck(msg)) {
                return msg.reply("Wait a minute before using a command.");
            }
            
            if (args.length == 3) {
                switch(args[2]) {
                    case "not":
                        funnyValue = -1;
                        break;
                    case "very":
                        funnyValue = 10;
                        break;
                    case "extremely":
                        funnyValue = 15;
                        break;
                    default:
                        funnyValue = 1;
                }
            }
            else {
                funnyValue = 1;
            }
            break;
        case "chuckled":
            if (user.user.id == msg.author.id) {
                return msg.reply("You can't give yourself funny points.");
            }
            else if (user.user.id == client.user.id) {
                return msg.reply("You can't give me funny points.");
            }

            if (cooldownCheck(msg)) {
                return msg.reply("Wait a minute before using a command.");
            }

            funnyValue = 5;
            break;
        case "points":
            if (user.id == client.user.id) {
                return msg.reply("I have 0 funny points.");
            }
            return msg.reply(`${user.user.username} has ${points[user.id]} funny points.`);
    }

    if (!funnyValue) return; // for any messages that fit the argument numbers and such but aren't the command.

    if (points[user.id]) {
        points[user.id] = points[user.id] + funnyValue;
    }
    else {
        points[user.id] = funnyValue;
    }
    msg.reply(`${funnyValue} funny points given to ${user.user.username}!`);
    write();
})

function cooldownCheck(msg) {
    if (cooldown.has(msg.author.id)) {
        return true;
    }
    else {
        cooldown.add(msg.author.id);
        setTimeout(() => {
            cooldown.delete(msg.author.id);
        }, 60000); // one minute per use
    }
    return false;
}

function write() {
    let data = JSON.stringify(points, null, 4);
    fs.writeFile('points.json', data, (err) => {
        if (err) {
            console.log("Error writing data");
            throw err;
        }
    })
}

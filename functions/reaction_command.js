let firebase = require('firebase');
let main = require('./../bot.js');
let bot = main.bot;
const Discord = require('discord.js');

const reaction_commands = [
    {
        from : '**Announce',
        emoji : '👍',
        result : (reaction,user) => {
            let message = reaction.message;
            let id = Math.random()*9+1;
            let content = message.content.split(':**')[1].split('React with 👍 to apply')[0];
            user.send(`Vous avez accepté l'annonce numéro ${id}.\nVoici son contenu : ${content}`);
        }
    },

    {
        from : 'announce',
        emoji : '👎',
        result : (reaction,user) => {
          return '<@'+user.id+'> Tu n\'es pas d\'accord';
        }
    }

];

module.exports = reaction_commands;
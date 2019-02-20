const Discord = require('discord.js');

function send(msg, message) {
	msg.channel.send(message);
}

let utility = [
  {
		name : 'date',
		description : 'say the current date',
		usage : '`a!date`',
		group: 'utility',
		result : (msg) => {
			if(!(msg.content=="a!date")) send(msg, 'There is no need for argument');
			let D = new Date();
			let H = D.getHours();
			let M = D.getMinutes();
			let S = D.getSeconds();
			send(msg, ':clock2: from you it\'s : '+H+':'+M+':'+S);
		}
	},

	{
		name : 'binary',
		description : 'Translate decimal to binary.',
		usage : '`a!binary` `an integer`',
		group: 'utility',
		result : (msg) => {
			let n = msg.content.split('binary')[1];
			let reg = /\d+/;
			if(reg.test(n)) {
				let r = Number(n).toString(2);
				send(msg, n+' = `'+r+'` in binary');
			} else {
				send(msg, 'Need a number');
			}
		}
	},
	
	{
		name : 'decimal',
		description : 'Translate binary to decimal.',
		usage : '`a!decimal` `an integer`',
		group: 'utility',
		result : (msg) => {
			let n = msg.content.split('decimal')[1];
			let reg = /[0-1]+/;
			if(reg.test(n)) {
				let r = parseInt(n,2);
				send(msg, '`'+n+'` = '+r+' in decimal');
			} else {
				send(msg, 'Need a number, and only 0 or 1');
			}
		}
    }
];

module.exports = utility;
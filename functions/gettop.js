let firebase = require('firebase');
let main = require('./../bot.js');
let bot = main.bot;
let DB = main.database;
const Discord = require('discord.js');
let dump = require('./dump.js');

const getTop = function(msg, args) {
	if(args.length>1) return;
	try {
		let type = 'scoreboard ';
		let user = [];
		let id = msg.author.id;

		DB.getTop(function(dat) {
			if(dat.val()!="test") {
				Data = dat.val().data;
				User = dat.val().user;
				let sName = User.name+"";
				user.push({
						name: sName.replace(/#\d+/,''),
						level: Data.level,
						xp: Data.xp,
						id: User.id
				});
			}
		});
		
		let sentences = [
			'loading', 'finding who\'s the best', 'watching your rank',
			'searching the AFK'
		];

		let r = Math.floor(Math.random()*(sentences.length));
		let sentence = sentences[r]+"...";

		let txt = "🏆🌐 SCOREBOARD:\n= NAME: ="+(' '.repeat(28))+"= XP: =\n\n";
		msg.channel.send(sentence).then(message => {
			setTimeout(function() {
				user.sort(function(a,b) {return b.xp-a.xp});
				id = new RegExp(id);
				let j = 0;

				for(i in user) {
					j++;
					if(id.test(user[i].id)) break;
				}

				let iPage = Math.round(args[0]);

				if(iPage<1 || iPage*10-10>user.length || isNaN(iPage)) iPage = 1;
				let iEnd = iPage*10-1;
				let iStart = iPage*10-10;
				let iMaxPage = Math.ceil((user.length)/10);

				for(i=iStart; i<iEnd; i++) {
					if(i==user.length) break;
					let n = user[i].name+"";
					let l = user[i].level+"";
					txt += n+' ('+l+')'+(' '.repeat(Math.abs(25-n.length)))+'::'+(' '.repeat(15))+user[i].xp+'\n';
				}

				switch(j) {
					case 1:
						j = '🥇'+j;
						break;
					case 2:
						j = '🥈'+j;
						break;
					case 3:
						j = '🏅'+j;
						break;
				}
				message.edit('```asciidoc\n'+txt+'\nPage '+iPage+'/'+iMaxPage+' | '+(user.length)+' total users\nYour place: '+j+'```');
			},DB.responseTime);
		});
	} catch(error) {
		let embed = new Discord.RichEmbed()
			.setAuthor('⚠️ Error ('+error.name+')')
			.setColor(0xFFA500)
			.setDescription('```'+error.message+'```');
		msg.channel.send(embed);
	}
};

module.exports = getTop;
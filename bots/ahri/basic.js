let firebase = require('firebase');
let main = require('./../../bot.js');
let bot = main.bot;
let DB = main.database;
const champ = require('./../../functions/champions.json');
const Discord = require('discord.js');
const fs = require('fs');

// Basic - Games - Utility - Personal - Social - management

// External functions
const admin = require('./../../functions/admin.js');
const check2 = require('./../../functions/checktwo.js');
const getTop = require('./../../functions/gettop.js');
const mtsm = require('./../../functions/mtsm.js');
const dump = require('./../../functions/dump.js');
const profile = require('./../../functions/profile.js');

// *** //

function send(msg, message) {
	msg.channel.send(message);
}

let commands = [];

let basic = [
    {
		name : 'help',
		description : 'say the list of commands and their explanation. if you add a key command behind `a!help`, it will say you the explanation of this key command.',
		usage : '`a!help` `key (optional)`',
		group: 'basic',
		result : (msg) => {
			let reg = /^help (\w+)$/;
			let mod_commands = basic.concat(main.commands);
			
			if(reg.test(msg.content.split('a!')[1])) {
				let n = msg.content.split('help ')[1];
				let text = '';
				
				for(let i=0; i<commands.length;i++) {
						let reg2 = new RegExp(commands[i].name);
						if(reg2.test(n)) {
							text = "  • `"+n+"` : ";
							text += commands[i].description+'\n\tWrite → '+commands[i].usage;
							if(commands[i].group!='hidden'){return text;}
						}
					}
				
				return 'I can\'t help you, the command does not exist 😓';
				
			} else if(/^(help)$/.test(msg.content.split('a!')[1])) {
				let txt = "";
				let c = "";
				for(let i=0; i<mod_commands.length; i++) {
					let cmd = mod_commands[i];
					if(cmd.group!='hidden' && cmd.group!=null) {
						let m = cmd.group;
						if(m===undefined) m = "basic";
						m = "\n__**"+m.charAt(0).toUpperCase()+m.slice(1)+"**__\n";
						if(c!=m) {
							msg.author.send(txt);
								txt = "";
							txt += m;

						}
						c = m;
						txt += "• `"+cmd.name+"` : "+cmd.description+"\n\t→"+cmd.usage+"\n";
					}
				}
				msg.author.send(txt);
				return 'All commands sent in your DMs';
			} else {
				return 'not_find';
			}
		}
    },
    
    {
		name: 'helplight',
		group: 'hidden',
		result: (msg) => {
			let txt = '';
			if(admin(msg.author.id)) {
				for(i in commands) {
					txt += '`'+commands[i].name+'`, ';
				}
				return txt;
			}
		}
	},
	
	{
		name: 'roleID',
		group: 'hidden',
		result: (msg) => {
			let Nroles = msg.guild.roles.map(role => role.name);
			let Iroles = msg.guild.roles.map(role => role.id);
			let txt = '```asciidoc\n';

			for(i in Nroles) {
				txt += Nroles[i] + (' '.repeat(30-Nroles[i].length)) + ':: ' + Iroles[i] + '\n'; 
			}

			txt += '```';
			return txt;
		}
	},
	
	{
		name: 'ev',
		description: 'show the result of javascript code',
		usage: 'a!ev {js code}',
		group: 'hidden',
		result: (msg) => {
			if(!admin(msg.author.id)) return;
			let res = '';
			let output = msg.content.split('ev ')[1];
			if(/process\.exit\(0\)/.test(output)) return;
			output = output.replace(/console\.log\((\w+)\)/gm,'send(msg,$1)');
			try {
				res = eval(output);
			} catch(error) {
				res = error;
			}
			output = output.replace(/;(\s+)?/gm,';\n');
			let embed = new Discord.RichEmbed()
				.addField('**:inbox_tray: Input:**','```js\n'+output+'```')
				.addField('**:outbox_tray: Output:**','```js\n'+res+'```');
			return embed;
		}
	},
    
    {
		name: 'guilds',
		group: 'hidden',
		result: (msg) => {
			if(admin(msg.author.id)) {
				let guildList = bot.guilds.array();
				let txt = "";
				let aGuild = [];

				try {
					guildList.forEach(guild => 
						aGuild.push(
							{
								name: guild.name,
								id: guild.id,
								owner: guild.owner
							}
						)
					);
				} catch (err) {
					
				}

				let iPage = Math.round(msg.content.split('guilds ')[1]);
				if(iPage<1 || iPage*10-10>aGuild.length || isNaN(iPage)) iPage = 1
				let iEnd = iPage*10-1;
				let iStart = iPage*10-10;
				let iMaxPage = Math.ceil(aGuild.length/10);
				for(i=iStart; i<iEnd; i++) {
					if(i==aGuild.length) break;
					txt += "-• Guild name: "+aGuild[i].name+"\n\t\tGuild ID: "+aGuild[i].id+"\n\t\tGuild owner: "+aGuild[i].owner+"\n"
				}
				return '```diff\n'+txt+'\nPage '+iPage+'/'+iMaxPage+' | '+aGuild.length+' guilds```';
			}
		}
    },
    
    {
		name: 'servi',
		group: 'hidden',
		result: (msg) => {
			if(!(msg.content=="a!serv")) return 'not_find';
			try {
				var a = msg.guild.id;
				return 'You are on `'+msg.guild.name+'` server';
			} catch(err) {
				return 'You are on private message with me';
			}
		}
    },
    
    {
		name: 'ans',
		group: 'hidden',
		result: (msg) => {
			if(admin(msg.author.id)) {
				var id = msg.content.replace(/a!ans\s+<@!?(\d+)>\s+\w+/,'$1').replace(/[a-zA-Z\s+]+/,'');
				var message = msg.content.replace(/a!ans\s+<@!?\d+>\s+(\w+)/,'$1');

				bot.fetchUser(id).then(user => {
					user.createDM().then(channel => {
						let embed = new Discord.RichEmbed()
							.setAuthor("ドリアン#8850 answered you :")
							.setColor(0x007FFF)
							.setThumbnail(msg.author.avatarURL)
							.addField("message :",message);
						channel.send(embed);
					});
				});

				return 'Message envoyé à <@'+id+'>';
			}
		}
	},
	
	{
		name: 'add',
		group: 'hidden',
		result: (msg) => {
			if(admin(msg.author.id)) {
				if(/a!add \d+ <@(\d+)>/.test(msg.content)) {
					let id = msg.content.replace(/a!add \d+ <@(\d+)>/, '$1');
					let add = msg.content.replace(/a!add (\d+) <@\d+>/, '$1');
					let a = {};
					let defined = false;
					
					DB.profile(id).getUser(function(data) {
							data = data.val();

							if(data==null) {
								send(msg,'this user doesn\'t have an account');
							} else {
								a.id = data.id;
								a.name = data.name;

								DB.profile(id).getData('data', function(data2) {
									data2 = data2.val();
									a.money = parseInt(data2.money);
									a.money += parseInt(add);
									defined = true;
								});
							}	
					});

					setTimeout(function() {
						if(defined) {
							DB.profile(id).setData('data/money',a.money);
							send(msg, add+' gem(s) :gem: added to `'+a.name+'`');
						}
					},DB.responseTime);
				}
			}
		}
	},

	{
		name: 'remove',
		group: 'hidden',
		result: (msg) => {
			if(admin(msg.author.id)) {
				if(/a!rem \d+ <@(\d+)>/.test(msg.content)) {
					let id = msg.content.replace(/a!remove \d+ <@(\d+)>/, '$1');
					let rem = msg.content.replace(/a!remove (\d+) <@\d+>/, '$1');
					let a = {};
					let defined = false;
					
					DB.profile(id).getUser(function(data) {
						data = data.val();

						if(data==null) {
							send(msg,'this user doesn\'t have an account');
						} else {
							a.id = data.id;
							a.name = data.name;

							DB.profile(id).getData('data', function(data2) {
								data2 = data2.val();
								a.money = parseInt(data2.money);
								a.money -= parseInt(rem);
								defined = true;
							});
						}	
					});

					setTimeout(function() {
						if(defined) {
							DB.profile(id).setData('data/money',a.money);
							send(msg, rem+' gem(s) :gem: removed to `'+a.name+'`');
						}
					},DB.responseTime);
				}
			}
		}
	},
	
	{
		name : 'reset',
		description : 'reset you password',
		usage : '`a!reset`',
		group: 'hidden',
		result : (msg) => {
			let name = msg.author.username+'#'+msg.author.discriminator;

			let reset;
			let Now = Date.now();
		   
			DB.getData('param', function(data) {
				reset = data.val()._reset;
				resetDelay = data.val()._resetTime;
			});
  	 		
  	 		setTimeout(function() {
  	 			if(reset==1) {
  	 				let pass = randPass();
					   DB.updateData('param/_reset', 0).updateData('param/_resetTime', Now).updateData('param/password', pass);
  	 				msg.author.createDM().then(channel => {
						channel.send('• Username: '+name+'\n• Password: '+pass+'\nConnect you to dorian.thivolle.net/ahri to manage your account.').then(sentMessage => sentMessage.pin());
					});
						
  	 			} else {
  	 				send(msg, 'You need to reclick on `reset` button because the time is over.\nhttps://dorian.thivolle.net/ahri');
  	 			}
  	 			
  	 		},DB.responseTime);
		}
	},
    
    {
		name: 'server',
		description : 'display the informations of the server.',
		usage: '`a!server`',
		group: 'basic',
		result : (msg) => {
			if(msg.content!="a!server") return 'not_find';
			let Nroles = msg.guild.roles.map(role => role.name);
			let NRoles = Nroles.toString().split(',');
			let roles = '';
			let end = ', ';
			for(i in NRoles) {
				if(i==0) continue;
				if(i==NRoles.length-1) end = '';
				roles += NRoles[i]+end;
			}
			
			let Guild = msg.guild;
			
			let channels = Guild.channels.size;
			
			let online = parseInt(Guild.memberCount-Guild.members.filter(member => member.presence.status === 'offline').size);
			
			let embed = new Discord.RichEmbed()
				.setTitle(Guild.name.toUpperCase()+' information')
				.setThumbnail(Guild.iconURL)
				.setColor(0x43FF4E)
				.addField("Owner", '• '+Guild.owner.user.tag+'\n• (ID: '+Guild.ownerID+')')
				.addField("Roles", '• '+Guild.roles.size+'\n• '+roles)
				.addField("Members", '• '+Guild.memberCount+'\n• Online : '+online)
				.addField("Channels ", '• '+channels)
				.addField("Region", '• '+Guild.region)
				.addField("Create on ", '• '+Guild.createdAt);

			return embed;
		}
	},

	{
		name : 'invite',
		description : 'display the invite link of the super bot Ahri.',
		usage : '`a!invite`',
		group: 'basic',
		result : (msg) => {
			if(!(msg.content=="a!invite")) return 'not_find';
			let link = 'https://discordapp.com/oauth2/authorize?client_id=477918672732553216&scope=bot&permissions=535948401';
			let embed = new Discord.RichEmbed()
				.setTitle('Ahri\'s link')
				.setThumbnail('https://media.giphy.com/media/4To81xP5Yw3noDC4rE/giphy.gif')
				.setColor(0x43FF4E)
				.setDescription(link)
				.addField('Note','If my creator doesn\'t have internet, I will not be able to be connected.')
				.addField('Why donate to Paypal ?','My goal is to be host on a VPS to be online h24. \n$12 = 1 years hosting.')
				.addField('Link :','https://paypal.me/NoxFly')
				.setFooter('Version 1.2', 'https://media.giphy.com/media/4To81xP5Yw3noDC4rE/giphy.gif');
			return embed;
		}
    },
    
    {
		name : 'donate',
		description : 'show you the link of my Paypal. The goal is to be host in a VPS to be online 24/7. Even $1 is enought',
		usage : '`a!donate`',
		group: 'basic',
		result : (msg) => {
			if(!(msg.content=="a!donate")) return 'not_find';
			let r = msg.content.substring(8);
			if(r=='') {
				let embed = new Discord.RichEmbed()
					.setTitle('My paypal :')
					.setColor(0x007FFF)
					.addField('Why donate to Paypal ?','My goal is to be host on a VPS to be online 24/7. \n$12 = 1 year')
					.addField('Link :','https://paypal.me/NoxFly');
				return embed;
			}
		}
    },
    
    {
		name: 'ping',
		description: 'Show the ms you have between when you send message and my reaction',
		usage: '`a!ping`',
		group: 'basic',
		result: (msg) => {
			if(!(msg.content=="a!ping")) return 'not_find';
			send(msg,":ping_pong: pong !\n*"+Math.round(bot.ping)+" ms*");
		}
    },
    
    {
		name: 'modules',
		description: 'Show possible extensions of Ahri. These extensions add more commands and unlock more possibilities.',
		usage: '`a!modules`',
		group: 'basic',
		result: (msg) => {
            if(!(msg.content=="a!modules")) return 'not_find';
            let modules = '';
			let end = ' - ';
			fs.readdir('bots/ahri/modules', function(err, items) {
				for (var i=0; i<items.length; i++) {
					if(i==items.length-1) end = '';
					modules += items[i].replace('.js','')+end;
					console.log(modules);
				}

				let embed = new Discord.RichEmbed()
					.setTitle('Modules')
					.setColor(0x43FF4E)
					.addField(
						'You can install or uninstall group of commands on the server writing\n`a!config modules.add {name}`', modules
					)
					.setDescription('I recommend you to install the modules game, personal and social');

				send(msg, embed);
			});
		}
	},
	
	{
		name: 'config',
		description: 'Some possible configurations, and adding or removing modules',
		usage: '`a!config {config}`',
		group: 'basic',
		result: (msg) => {
			let App = main.app;
			let cmd = msg.content.split('config ')[1];
			if(cmd===undefined) return 'Usage: `'+basic.filter((c)=>c.name=='config')[0].usage+'`';
			
			if(/^module/.test(cmd)) {
				let arg = cmd.split('module')[1];
				if(arg=='') return 'Command not complete, I can\'t do anything';
				if(!admin(msg.author.id) && msg.author.id!==msg.guild.ownerID) return 'You can\'t manage modules';
				fs.readdir('bots/ahri/modules', function(err, items) {
					let modules = [];
					for (var i=0; i<items.length; i++) {
						modules.push(items[i].replace('.js',''));
					}

					if(arg.startsWith('.add')) {
						arg = arg.split('.add ')[1];
						let mod_sav = App[msg.guild.id].modules;
						let download = [];
						for(i in mod_sav) {
							download.push(mod_sav[i]);
						}
						if(arg===undefined) return 'Specify a module please';
						arg = arg.toLowerCase();
						if(modules.indexOf(arg)===-1) {
							send(msg,'This module does not exist\n`a!modules` to see availible modules');
						} else if(download.indexOf(arg)!==-1) {
							send(msg, 'You already have this module');
						} else {
							DB.server(msg.guild.id).addData('modules', arg, arg);
							msg.channel.send('Installing... (0%)').then(message => {
								for(i=0; i<120; i+=20) {
									message.edit('Installing... ('+i+'%)');
									if(i==100) message.edit('Successfully installed:**`'+arg+'`**');
								}
							});
						}
					} else if(arg.startsWith('.remove')) {
						arg = arg.split('.remove ')[1];
						let mod_sav = App[msg.guild.id].modules;
						let download = [];
						for(i in mod_sav) {
							download.push(mod_sav[i]);
						}
						if(arg===undefined) return 'Specify a module please';
						arg = arg.toLowerCase();
						if(modules.indexOf(arg)===-1) {
							send(msg,'This module does not exist\n`a!modules` to see availible modules');
						} else if(download.indexOf(arg)===-1) {
							send(msg, 'You do not have this module');
						} else {
							DB.server(msg.guild.id).deleteData('modules/'+arg);
							send(msg, 'You uninstalled This module : `'+arg+'`');
						}
					}
				});
			} else {
				return 'not_find';
			}
		}
	},
    
    {
		name: 'markdown',
		description: 'Show you all markdown possibilities',
		usage: '`a!markdown`',
		group: 'basic',
		result: (msg) => {
			if(!(msg.content=="a!markdown")) return 'not_find';
			send(msg,
				'```*italics*'+(' '.repeat(20))+'_italics_\n**bold**'+(' '.repeat(20))+'__underline__\n~~Strikethrough~~```'
				+'```asciidoc\n= Markdown =\nasciidoc, autohotkey, bash, coffeescript, cpp (C++), cs (C#), css, diff, fix, glsl, ini, json, md (markdown), ml, prolog, py, tex, xl, xml```'
				+'Find all demo on https://gist.github.com/ringmatthew/9f7bbfd102003963f9be7dbcf7d40e51'
			);
		}
    },
    
    {
		name: 'remindme',
		description: 'send you a message in PM on the cooldown you wrote',
		usage: '`a!remindme {seconds}`',
		group: 'basic',
		result: (msg) => {
			let time = msg.content.split('remindme ')[1];
			if(/^\d+$/.test(time)) {
				let Rtime = parseInt(time);
				Rtime *= 1000;
				setTimeout(function() {
					msg.author.createDM().then(channel => {
						channel.send('Hey ! Time to remind you !');
					});
				}, Rtime);

				return 'Ok, I\'ll remind you in '+time+' seconds';
			} else {
				return 'need a number ! (seconds)';
			}
		}
    },
    
    {
		name : 'return',
		description : 'send a message to Ahri\'s creator.',
		usage : '`a!return` `your message`',
		group: 'basic',
		result : (msg) => {
			let name = msg.author.username+'#'+msg.author.discriminator;
			let authorMSG = msg.content.split('return ')[1];


			if(authorMSG===undefined) return 'Lol, my creator will not read an empty message, don\'t you ? :grimacing::joy:';

			let mpAuth, ans;
			let Now = Date.now();
			DB.getData('delay/mpAuth', function(data) {
				mpAuth = data.val();
			});

			setTimeout(function() {
				ans = mtsm(85400000-parseInt(Now-mpAuth));
				if(Now-mpAuth >=85400000) {
					mpAuth = Now;
					send(msg, ':incoming_envelope: :calling: message sent');

					DB.updateData('delay/mpAuth', mpAuth);
					let embed = new Discord.RichEmbed()
						.setTitle('You received a message from')
						.addField(name, msg.author.id)
						.setColor(0x007FFF)
						.setThumbnail(msg.author.avatarURL)
						.addField("message :", authorMSG);
		
					bot.users.get('316639200462241792').createDM().then(channel => {
						channel.send(embed);
					});
				}
				send(msg, 'You need to wait **'+ans+'** to send a new message :hourglass:');
			},DB.responseTime);
		}
    }
];

commands = basic.concat(main.commands);
//console.log('commands infile ('+commands.length+')');
module.exports = basic;
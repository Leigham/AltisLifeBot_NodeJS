const Discord = require("discord.js");
const client = new Discord.Client();
const auth = require("./auth.json");
const formatCurrency = require('format-currency')
const prefix = "!";
var mysql = require('mysql');
var md5 = require('md5');

var con = mysql.createConnection({
  host: auth.dbhost,
  user: auth.dbuser,
  password: auth.dbpassword,
  database: auth.db
});



client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
con.connect(function(err) {
  if (err) throw err;
  console.log("DB connection Established!");
});
client.on('message', msg => {
  if (msg.author.equals(client.user))return;//if is the bot, ignore the message.
  console.log(msg.author.id);
  if(!msg.content.startsWith(prefix))return;//if its not a prefix. ignore it.
  var args = msg.content.substring(prefix.length).split(" ");
  if (args[0] === 'ping') {
    msg.reply('Pong!');
  };
  if (args[0] == 'cash') {
    let query2 = "SELECT * FROM discordIntegration WHERE discordID = '" + msg.author.id + "'";
    con.query(query2, function (err, result, fields) {
      if (err) throw err;
      if (result.legth == 0) {
        msg.reply("You must link your arma account first. !linkArma");
      } else {
        let cashQuery = "SELECT cash FROM players WHERE pid = '" + result[0].steam64uid + "'";
        con.query(cashQuery, function (err, result, fields) {
          if (err) throw err;
          console.log(result);
          let opts = { format: '%c %v', code: '$' }
          let monies = (formatCurrency(result[0].cash, opts))
          let message = "You currently have " + monies;
          msg.reply(message);
        });
      };
    });
  };

  if (args[0] == 'bank') {
    let query2 = "SELECT * FROM discordIntegration WHERE discordID = '" + msg.author.id + "'";
    con.query(query2, function (err, result, fields) {
      if (err) throw err;
      if (result.legth == 0) {
        msg.reply("You must link your arma account first. !linkArma");
      } else {
        let cashQuery = "SELECT bankacc FROM players WHERE pid = '" + result[0].steam64uid + "'";
        con.query(cashQuery, function (err, result, fields) {
          if (err) throw err;
          let opts = { format: '%c %v', code: '$' }
          let monies = (formatCurrency(result[0].bankacc, opts))
          let message = "You currently have " + monies;
          msg.reply(message);
        });
      };
    });
  };


  if (args[0] == 'linkArma') {
    if (args.length < 3) {
      msg.reply('You must use the command like ``` !linkArma username password ```');
    } else {
      if (msg.channel.type != 'dm') {
        msg.reply('You must use this command in a private channel!');
      } else  {
        let query = "SELECT * FROM discordIntegration WHERE Username = '" + args[1] + "'";
        let discordID = msg.author.id;
        let query2 = "SELECT * FROM discordIntegration WHERE discordID = '" + discordID + "'";
        con.query(query2, function (err, result, fields) {
          if (err) throw err;
          if (result.length == 0) {
            con.query(query, function (err, result, fields) {
              if (err) throw err;
              if (result.length == 0) {
                msg.reply("That username does not exist");
              } else {
                let firstResult = result[0];
                let usernameOut = firstResult.Username;
                let passwordOut = firstResult.Password;
                let password = md5(args[2]);
                if (password != passwordOut) {
                  msg.reply("Oh fuck, you entered the wrong password!");
                } else {
                  let query3 = "UPDATE discordIntegration SET discordID = '"+ discordID +"' WHERE Username = '" + usernameOut + "' AND Password = '"+ passwordOut +"'";
                  con.query(query3, function (err, result, fields) {
                    if (err) throw err;
                    msg.reply("Account Linked!");
                  });
                };
              };
            });
          } else {
            msg.reply("Your account already seems to be linked, if you think this is wrong, please contact a server admin");
          }
        });
      };
    };
  };
});

client.login(auth.token);

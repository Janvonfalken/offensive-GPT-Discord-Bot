"use strict";


const TOKEN = "<your Token>"; //the token of the discord app of your bot (from the "Bot" option in the menu)
const botsChannelId = "934545604032483388"; //the channel where the bots answers, already set for #bots
const AI_TOKEN = 'Bearer <your token>'; //the token of textSynth.org api, must start with "Bearer"
const BOT_USER_ID = "<ID>" //the user ID of the bot in discord
const BOT_NAME ="<choose a name>"; //important to be consistent for multi-line response to work
const OTHER_BOTS = ["934541377495248926","897813098910609418"]




//the description that tells the bot who he is
var description = "<come up with a cool story here>"



var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
var fs = require('file-system');
var botsChannel;


const Discord = require('discord.js');
const bot = new Discord.Client();
var request = require('request');
bot.login(TOKEN);
var funnyResponseStr;



bot.on("ready", () => { //when the bot starts
  console.log("ready!");
  botsChannel = bot.channels.get(botsChannelId);
  botsChannel.send("Hey!");
  console.log("trying to say Hey!");
  funnyResponseStr = "";

});


  bot.on("message", (message) => {
  
  
  
  if (message.author.id == BOT_USER_ID){
      
      return; //if the bot sent the message then return so it won't get stuck in a loop
      
  } 
  

  let messageChannel = message.channel.id;
  
  if ( messageChannel  != botsChannelId){//ignore messeges that are not from the correct channel
    
    return;
    
  }
  
  
  
  
  let msg = message.content;
  
  
  
  //------------------None private messages-----(bot channel)----------------
  
  if (messageChannel  == botsChannelId){
    
    
    console.log("received message in the bots channel") //debug remove debug debug todo remove
    

    if (msg.toLowerCase().includes("hello")||msg.toLowerCase().includes(BOT_NAME)||msg.toLowerCase().includes("bot")|| ((Math.random() <= 0.8) && isBotId(message.author.id)) ){//use the self aware brain of the human
      console.log("trying to reply");
      let name = message.author.username;
	    let prompt = description+"\n--------\n"+name+": "+msg+"\n"+BOT_NAME+":";
	    //todo - change orenog
      request.post({
        url: 'https://api.textsynth.com/v1/engines/gptj_6B/completions',
        form: JSON.stringify({"prompt": prompt, "max_tokens": 80,"temperature": 1.0166 }), 
		    headers: {'Content-Type': 'application/json','Authorization':AI_TOKEN}, 
        method: 'POST',

        },
         function (error,response,body){
    		  funnyRespond(JSON.parse(body).text);
          console.log("API ERROR : "+error);
          console.log("API RESPONSE : "+response);
		  console.log("API BODY TEXT : \n"+JSON.parse(body).text);
		  console.log("THE PROMPT WAS "+prompt);


        }
      )
      
    //respond immediately with the given response, using the GPT-J format  
      if (funnyResponseStr == ""){return}
	  function funnyRespond(givenStr){
      var tmpStrs = givenStr.split('\n');
      funnyResponseStr=tmpStrs[0];
      let predictedSoneoneElse = false;
      for (let i = 1; i<tmpStrs.length && !predictedSoneoneElse; i++){//for each line (from the 2nd) of the bot's respnse, check if it's starts with "botname:", and if it is, send this line in the response as well, if it's not then cut the response there
        if (tmpStrs[i].substring(0,(BOT_NAME.length+1)) == (BOT_NAME+":")){
          funnyResponseStr+="\n"+tmpStrs[i].substring(7);
        }else{//if the line starts with something that is not "botname:"
          predictedSoneoneElse = true;
        }

      }
        try {
          funnyResponseStr = decodeURI(funnyResponseStr);
        } catch(err){}
		  //console.log(");
        if (funnyResponseStr != ""){
		  botsChannel.send(funnyResponseStr);
        }
	  }
     // funnyResponseStr+="NOTHING"
    }
    
    
    
    
    
    return;

 
  
  }});
  




function isBotId(id){

    return (OTHER_BOTS.includes(id));
    
}
  
  


//help function to use a sleep command (with async await)
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

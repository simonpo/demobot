// Requirements
var restify = require('restify');
var builder = require('botbuilder');
const util = require('util');
var discogs = require('disconnect').Client;
var os = require('os');
var analyrics = require('analyrics');

// see if we know the hostname
if ( process.env.WEBSITE_HOSTNAME ) {
    hostname = process.env.WEBSITE_HOSTNAME;
}
else {
    hostname = 'localhost';
}

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function()
{
   console.log('%s listening to %s', server.name, server.url); 
   // console.log('net.Server.address() === ' + require('util').inspect(server.server.address())); 
   // console.log('os hostname: %s', os.hostname());
   // console.log('process.env: %s', process.env.WEBSITE_HOSTNAME);
   // show me everything in process.env - there's some sensitive info in here, of course. Never expose to prod. 
   // console.log(util.inspect(process.env, false, null));
   console.log('My hostname is %s', hostname)
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MY_APP_ID,
    appPassword: process.env.MY_APP_PASSWORD
})
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
var serverName = server.url;

// Add  LUIS recognizer
// var luisModel = process.env.LUIS_MODEL;
var luisModel = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/13ad7c41-604a-45fb-9ac4-e8baf8addc89?subscription-key=aa00dbafeb704fb89151b8dcbe47d6e7&verbose=true";
var recognizer = new builder.LuisRecognizer(luisModel);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

// Create bot dialogs
bot.dialog('/', intents);
intents.matches('FormalGreeting', builder.DialogAction.send('Hello.'));
intents.matches('InformalGreeting', builder.DialogAction.send('Howdy!'));
// Get the tracks on a specific release from Discogs
intents.matches('GetTracks', [
    function (session, args, next) {
        // sometimes it's helpful to see what LUIS returned
        console.log(util.inspect(args, false, null));
        var tracklisting = builder.EntityRecognizer.findEntity(args.entities, 'SearchTopic');
        if (!tracklisting) {
            builder.Prompts.text(session, "Sorry, I didn't catch the title of the disk you want. What would you like the tracklisting for?", tracklisting);
        } else {
            session.send("You want me to show the tracks on %s", tracklisting.entity);
            var db = new discogs().database();
            db.getArtist(69719, function(err, data){
                console.log(data);
                });
            }
    }
]);
// Get lyrics for a specified song using https://www.npmjs.com/package/analyrics
intents.matches('GetLyrics', [
    function (session, args, next) {
        // sometimes it's helpful to see what LUIS returned
        console.log(util.inspect(args, false, null));
        var songtitle = builder.EntityRecognizer.findEntity(args.entities, 'SearchTopic');
        if (!songtitle) {
            builder.Prompts.text(session, "Sorry, I didn't catch the title. What song would you like the lyrics for?", songtitle);
            session.send("You want me to show the lyrics to %s", songtitle);
        } else {
            session.send("You want me to show the lyrics to %s", songtitle.entity);
            analyrics.getSong(songtitle.entity, function(song) {
                session.sendTyping();
                console.log(song.title);
                // console.log(song.artist);
                // console.log(song.url);
                console.log(song.lyrics);
                // console.log(song.frequency);
                // console.log(song.sentiment);
                session.send(song.title + " by " + song.artist);
                session.send(song.lyrics);
                session.send(song.url);
            });
        }
    }
]);
intents.matches('GetTweets', [
    function(session, args, next) {
        session.send("Looking for tweets")
    }
]);
intents.matches('Search', [
    function (session, args, next) {
        // sometimes it's helpful to see what LUIS returned
        console.log(util.inspect(args, false, null));
        var searchtopic = builder.EntityRecognizer.findEntity(args.entities, 'SearchTopic');
        if (!searchtopic) {
            builder.Prompts.text(session, "What would you like to search for?");
        } else {
        session.send("You want me to search the web for information on: %s", searchtopic.entity);
        }
    }
]);
intents.matches('StatusCheck', builder.DialogAction.send("Navigation Computer report:\n Orbital status now maintained. Target zone vectors logged in. The Tube is now ready. Please swallow your Blue Dreamer, and place the helmet on your head"));
intents.matches('Help', builder.DialogAction.send("I don't have a lot to do at the moment. Try asking me for the lyrics of your favourite Hawkwind song, or info about band members."));
intents.matches('AboutTheBot', builder.DialogAction.send("Well, hi there. I'm glad you asked. I'm a chat bot, built by Simon Powell to answer questions. Hopefully I'll get smarter in the future. My server is " + process.env.WEBSITE_HOSTNAME ));
intents.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I don't know a lot yet."));

// web interface
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html',
}));

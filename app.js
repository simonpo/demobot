// Requirements
var restify = require('restify'); 
var builder = require('botbuilder'); 
const util = require('util');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});

// var msg = "This is "+ process.env.NODE_ENV + " environment";
// console.log(msg);

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MY_APP_ID,
    appPassword: process.env.MY_APP_PASSWORD
})
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Add  LUIS recognizer
// var luisModel = process.env.LUIS_MODEL;
var luisModel = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/13ad7c41-604a-45fb-9ac4-e8baf8addc89?subscription-key=aa00dbafeb704fb89151b8dcbe47d6e7&verbose=true";
var recognizer = new builder.LuisRecognizer(luisModel);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

// Create bot dialogs
bot.dialog('/', intents);
intents.matches('FormalGreeting', builder.DialogAction.send('Hello.'));
intents.matches('InformalGreeting', builder.DialogAction.send('Howdy!'));
intents.matches('GetLyrics', [
    function (session, args, next) {
        // sometimes it's helpful to see what LUIS returned
        console.log(util.inspect(args, false, null));
        var songtitle = builder.EntityRecognizer.findEntity(args.entities, 'SearchTopic');
        if (!songtitle) {
            builder.Prompts.text(session, "Sorry, I didn't catch the title. What song would you like the lyrics for?", songtitle);
        } else {
            session.send("You want me to show the lyrics to %s", songtitle.entity);
            


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
intents.matches('AboutTheBot', builder.DialogAction.send("Well, hi there. I'm glad you asked. I'm a chat bot, built by Simon Powell to answer questions about Hawkwind. Hopefully I'll get smarter in the future."));
intents.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I don't know a lot yet."));


// web interface
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html',
}));
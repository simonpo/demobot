// Add your requirements
var restify = require('restify'); 
var builder = require('botbuilder'); 

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
var model = process.env.model
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

// Create bot dialogs
bot.dialog('/', dialog);
dialog.matches('FormalGreeting', builder.DialogAction.send('Hello.'));
dialog.matches('InformalGreeting', builder.DialogAction.send('Howdy!'));
dialog.matches('GetLyrics', [
    function (session, args, next) {
        var songtitle = builder.EntityRecognizer.findEntity(args.entities, '*');
        if (!songtitle) {
            builder.Prompts.text(session, "What song would you like the lyrics for?", songtitle);
        } else {
        session.send("You want me to search for the lyrics to %s", songtitle);
        }
    }
]);
dialog.matches('Search', [
    function (session, args, next) {
        var searchtopic = 'DikMik' // builder.EntityRecognizer.findEntity(args.entities, 'SearchTopic');
        console.log('Search topic was %s', searchtopic);
        if (!searchtopic) {
            builder.Prompts.text(session, "What would you like to search for?");
        } else {
        session.send("You want me to search for something %s", searchtopic);
        }
    }
]);
dialog.matches('StatusCheck', builder.DialogAction.send("Navigation Computer report:\n Orbital status now maintained. Target zone vectors logged in. The Tube is now ready. Please swallow your Blue Dreamer, and place the helmet on your head"));
dialog.matches('Help', builder.DialogAction.send("I don't have a lot to do at the moment. Try asking me something like what are the words to your favourite Hawkwind song, or dates of a gig."));
dialog.matches('AboutTheBot', builder.DialogAction.send("Well, hi there. I'm glad you asked. I'm just a chat bot, built by Simon Powell to answer questions about Hawkwind"));
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I don't know a lot yet."));


// web interface
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));
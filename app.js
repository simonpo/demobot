// Add your requirements
var restify = require('restify'); 
var builder = require('botbuilder'); 

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});

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
dialog.matches('FormalGreeting', builder.DialogAction.send('A very formal Hello to you too'));
dialog.matches('InformalGreeting', builder.DialogAction.send('Howdy!'));
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
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I don't know a lot yet."));


// web interface
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));
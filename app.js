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
//  appId: 'f1612abf-5dee-4f23-a01b-210af7e524a6',
//  appPassword: 'dsveOyJ21WYhvThszpvxWji'  
    appId: process.env.MY_APP_ID,
    appPassword: process.env.MY_APP_PASSWORD
})
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Create bot dialogs
bot.dialog('/', function (session) {
    session.send("Hello Everybody");
});

// web interface
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));
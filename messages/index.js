/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://docs.botframework.com/en-us/node/builder/chat/dialogs/#waterfall
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

bot.dialog('/', [
    function (session) {
        builder.Prompts.text(session, "Hello!... What's your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response + ". I hope you would like to learn something about building bots? How many years have you been coding?"); 
    },
    function (session, results) {
        session.userData.coding = results.response;
        builder.Prompts.choice(session, "What language have you used for coding before?", ["Java", "JavaScript", "TypeScript", "C#"]);
    },
    function (session, results) {
        session.userData.language = results.response.entity;
        session.send("Got it... " + session.userData.name + 
                    " you've been programming for " + session.userData.coding + 
                    " years and use " + session.userData.language + ".");
        builder.Prompts.choice(session, "Now do you want to learn something about building bots?", ["yes", "no"]);
    },    
    function (session, results) {
        session.userData.willToLearn = results.response.entity;
        
        if(session.userData.willToLearn=="yes"){
        session.send("Got it... so here is a first definition: a chatbot is a program and a communication medium, which isn't necessarily linked to AI but always has to be able of processing natural language in textual or spoken form, and normally should provide some benefit. I - as a chatbot - am trying to help you to gain knowledge about a specific topic, i.e.: Building and using chatbots for educational purposes.");
        builder.Prompts.choice(session, "Now you want to learn something about building bots... bot for which purpose?", ["educational", "business"]);
        }
        else {
            session.send("Got it, you don't want to learn");
        }
    },
    function (session, results) {
        session.userData.purpose = results.response.entity;
        
        if(session.userData.purpose=="educational"){
            session.send("That's great! An educational chatbot... ummmh well, i don't really know a lot about that.")//TODO
            builder.Prompts.choice(session, "But ...Let's start with a quick test question. Whats the most important principle in bot-design : a) should seem to behave like a really human being, b) should offer a flawless and easy conversation c) should understand spoken language (just type the correct letter)", ["a", "b", "c"]);
        }
        if(session.userData.purpose=="business"){
            session.send("That's great! But I won't be really able to help you. Maybe you could have a look on this fancy website : https://chatbotsmagazine.com/whats-it-like-to-build-run-a-chatbot-business-751935913300 ... and also IBM Watson might be interesting for you! ")
        }
    },
     function (session, results) {
        session.userData.testAnswer = results.response.entity;
        if(session.userData.testAnswer == "b"){
            session.send("Yes, that's the right answer! if you want to have mor information on bot design-principles, check this page: https://docs.microsoft.com/en-us/bot-framework/bot-design-principles")
        }
        else{
            session.send("No that's only your opinion ...that was not correct. It is b)! If you want to know why you could check this site: https://docs.microsoft.com/en-us/bot-framework/bot-design-principles")
        }
     },
]);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

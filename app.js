const { Client, GatewayIntentBits } = require('discord.js');  // Import the correct intent flags
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();  // Load environment variables from .env

const app = express();

// Create a new Discord client instance with all required intents
const botClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,               // Access to Guilds
        GatewayIntentBits.GuildMembers,         // Access to Guild members
        GatewayIntentBits.GuildMessages,        // Access to Guild messages
        GatewayIntentBits.MessageContent,       // Access to message content (for reading messages)
        GatewayIntentBits.GuildEmojisAndStickers, // Access to emojis and stickers
        GatewayIntentBits.GuildIntegrations,    // Access to integrations in guilds
        GatewayIntentBits.GuildVoiceStates,     // Access to voice states (joining, leaving voice channels)
        GatewayIntentBits.GuildPresences,       // Access to presences (status, online/offline)
        GatewayIntentBits.GuildModeration,      // Access to guild moderation features (bans, kicks, etc.)
        GatewayIntentBits.DirectMessages,       // Access to direct messages with users
        GatewayIntentBits.DirectMessageReactions, // Access to reactions in direct messages
        GatewayIntentBits.DirectMessageTyping,   // Access to typing status in DMs
    ]
});
botClient.login(process.env.BOT_TOKEN);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(session({
    secret: 'discord-bot-dashboard-secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/');
});

app.get('/auth/logout', (req, res) => {
    req.logout(err => {
        if (err) console.error(err);
        res.redirect('/');
    });
});

app.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        // Fetch guilds where the bot is present
        const botGuilds = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` }
        }).then(res => res.json());

        // Filter mutual guilds where the user has admin permissions
        const mutualGuilds = botGuilds.filter(guild =>
            req.user.guilds.some(userGuild => userGuild.id === guild.id && (userGuild.permissions & 0x20) === 0x20)
        );

        res.render('dashboard', {
            user: req.user,
            servers: mutualGuilds
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching dashboard data.');
    }
});

// Server Management Route
app.get('/dashboard/:serverId', ensureAuthenticated, async (req, res) => {
    try {
        const serverId = req.params.serverId;
        const botGuilds = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` }
        }).then(res => res.json());

        const server = botGuilds.find(guild => guild.id === serverId);

        if (!server) {
            return res.status(404).send('Server not found.');
        }

        // Server management logic goes here. For example, showing commands to manage this server.
        res.render('server-management', {
            user: req.user,
            server: server
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching server data.');
    }
});

// Helper Function for Auth Check
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
}

// EJS Views Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Render Port Compatibility
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

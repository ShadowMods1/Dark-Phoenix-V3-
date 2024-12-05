const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();  // Load environment variables from .env

const app = express();

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

// Dashboard Route (Shows all servers the bot is in)
app.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        // Fetch the guilds the bot is in
        const botGuilds = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` }
        }).then(res => res.json());

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

// Server Management Route (for a specific server)
app.get('/dashboard/:serverId', ensureAuthenticated, async (req, res) => {
    try {
        const serverId = req.params.serverId;
        
        // Fetch the guilds the bot is in
        const botGuilds = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` }
        }).then(res => res.json());

        // Find the specific server
        const server = botGuilds.find(guild => guild.id === serverId);

        if (!server) {
            return res.status(404).send('Server not found.');
        }

        res.render('server-management', {
            user: req.user,
            server: server
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching server data.');
    }
});

// New Routes for About, Install, Commands, Help, Status
app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/install', (req, res) => {
    res.render('install');
});

app.get('/commands', (req, res) => {
    res.render('commands');
});

app.get('/help', (req, res) => {
    res.render('help');
});

app.get('/status', (req, res) => {
    res.render('status');
});

app.get('/dashboard', (req, res) => {
    res.render('server-management'); // Render your Dashboard page
});

app.get('/add-bot', (req, res) => {
    res.render('addBot'); // Render your Add Bot page
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

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const fetch = require('node-fetch');
const config = require('./config.json');

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
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
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
        const botGuilds = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { Authorization: `Bot ${config.botToken}` }
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

// Helper Function
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
}

// EJS Views Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Glitch Port Compatibility
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

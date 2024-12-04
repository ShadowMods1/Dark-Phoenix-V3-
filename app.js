require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const fetch = require('node-fetch');
const path = require('path');
const { Strategy: DiscordStrategy } = require('passport-discord');
const socketIO = require('socket.io');

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // View folder

// Passport setup
passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['identify', 'guilds', 'bot'],
}, (accessToken, refreshToken, profile, done) => {
    return done(null, { accessToken, profile });
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    });

app.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const botGuilds = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { Authorization: `Bearer ${req.user.accessToken}` }
        }).then(res => res.json());

        res.render('dashboard', { user: req.user, servers: botGuilds });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).send('Error fetching dashboard data.');
    }
});

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Server and Socket.io setup
const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

const io = socketIO(server);
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', (serverId, message) => {
        console.log(`Sending message to server ${serverId}: ${message}`);
        // Logic to send a message to the server
    });

    socket.on('banUser', (serverId, userId) => {
        console.log(`Banning user ${userId} from server ${serverId}`);
        // Logic to ban a user from the server
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

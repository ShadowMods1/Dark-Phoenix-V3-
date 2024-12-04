const express = require('express');
const passport = require('passport');
const Discord = require('discord.js');
const session = require('express-session');
const { ensureAuthenticated } = require('./middleware/auth'); // Ensure user is authenticated
const { getServerInfo, manageBotCommands } = require('./botController'); // Custom controller for bot logic

const app = express();

// Set up the view engine (EJS)
app.set('view engine', 'ejs');
app.set('views', './views');

// Use middleware
app.use(express.static('public'));
app.use(session({ secret: 'your-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Sample bot token (replace this with your actual bot setup)
const botClient = new Discord.Client();
botClient.login('YOUR_BOT_TOKEN');

// Route to home page
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('index', { user: req.user });
    } else {
        res.redirect('/login');
    }
});

// Route for the login page (Redirect to Discord OAuth)
app.get('/login', (req, res) => {
    res.send('<a href="/auth/discord">Login with Discord</a>');
});

// Discord OAuth authentication route
app.get('/auth/discord', passport.authenticate('discord', { scope: ['identify', 'guilds'] }));

// Discord OAuth callback route
app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);

// Route to view server dashboard
app.get('/dashboard/:serverId', ensureAuthenticated, async (req, res) => {
    const { serverId } = req.params;

    try {
        // Fetch the server information (using Discord.js)
        const server = await botClient.guilds.fetch(serverId);
        const serverData = {
            id: server.id,
            name: server.name,
            icon: server.icon,
        };

        res.render('dashboard', { server: serverData });
    } catch (error) {
        console.error("Error fetching server:", error);
        res.status(500).send('Error fetching server details');
    }
});

// Route for the kick command (example)
app.get('/dashboard/:serverId/kick', ensureAuthenticated, async (req, res) => {
    const { serverId } = req.params;

    try {
        const server = await botClient.guilds.fetch(serverId);
        const member = await server.members.fetch(req.query.userId); // Example user ID from the query string

        if (member) {
            await member.kick('User kicked from server via dashboard');
            res.send(`User ${member.user.username} has been kicked from the server.`);
        } else {
            res.status(404).send('User not found in the server.');
        }
    } catch (error) {
        console.error("Error kicking user:", error);
        res.status(500).send('Error executing kick command');
    }
});

// Route for the ban command (example)
app.get('/dashboard/:serverId/ban', ensureAuthenticated, async (req, res) => {
    const { serverId } = req.params;

    try {
        const server = await botClient.guilds.fetch(serverId);
        const member = await server.members.fetch(req.query.userId); // Example user ID from query string

        if (member) {
            await member.ban({ reason: 'User banned from server via dashboard' });
            res.send(`User ${member.user.username} has been banned from the server.`);
        } else {
            res.status(404).send('User not found in the server.');
        }
    } catch (error) {
        console.error("Error banning user:", error);
        res.status(500).send('Error executing ban command');
    }
});

// Route for sending an announcement to the server
app.get('/dashboard/:serverId/announce', ensureAuthenticated, async (req, res) => {
    const { serverId } = req.params;

    try {
        const server = await botClient.guilds.fetch(serverId);
        const channel = server.systemChannel || server.channels.cache.find(ch => ch.type === 'text');

        if (channel) {
            await channel.send('**Announcement:** Your bot made an announcement!');
            res.send('Announcement sent successfully!');
        } else {
            res.status(404).send('No valid channel found for announcement.');
        }
    } catch (error) {
        console.error("Error sending announcement:", error);
        res.status(500).send('Error executing announcement command');
    }
});

// Route for clearing messages
app.get('/dashboard/:serverId/clear', ensureAuthenticated, async (req, res) => {
    const { serverId } = req.params;

    try {
        const server = await botClient.guilds.fetch(serverId);
        const channel = server.channels.cache.find(ch => ch.type === 'text');

        if (channel) {
            const messages = await channel.messages.fetch({ limit: 100 });
            await channel.bulkDelete(messages);
            res.send('Messages cleared successfully!');
        } else {
            res.status(404).send('No text channels found in the server.');
        }
    } catch (error) {
        console.error("Error clearing messages:", error);
        res.status(500).send('Error executing clear messages command');
    }
});

// Route for changing bot prefix
app.get('/dashboard/:serverId/prefix', ensureAuthenticated, (req, res) => {
    const { serverId } = req.params;

    // You would need to implement the logic to store and update the prefix for each server
    // For simplicity, we'll mock it as a simple page for now
    res.send(`Change the bot prefix for server ${serverId}`);
});

// Fallback 404 route
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

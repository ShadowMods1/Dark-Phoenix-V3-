// Importing necessary modules
const express = require('express');
const path = require('path');

// Initialize Express application
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files (like stylesheets, images, etc.) from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Sample data to pass into the EJS template
const sampleData = {
  title: 'Dashboard',
  logoName: 'My Dashboard',
  navLinks: [
    { href: '/home', text: 'Home' },
    { href: '/settings', text: 'Settings' },
    { href: '/profile', text: 'Profile' }
  ],
  stats: [
    { label: 'Users', value: '1200' },
    { label: 'Posts', value: '3500' },
    { label: 'Comments', value: '12000' }
  ],
  quickActions: [
    { text: 'Add New Post', class: 'btn-primary' },
    { text: 'Manage Users', class: 'btn-secondary' }
  ],
  channels: [
    { name: 'General', active: true },
    { name: 'Help', active: false },
    { name: 'Feedback', active: false }
  ],
  messages: [
    { username: '5hadow_pho3nix', timestamp: '12:30 PM', content: 'Welcome to the dashboard!' },
    { username: 'AFRIENDLYHACKER', timestamp: '12:31 PM', content: 'Use !help for a list of commands!' },
    { username: 'Random_User123', timestamp: '12:32 PM', content: '!help'},
    { 
      username: 'Dark Phoenix(V3)', 
      timestamp: '12:32 PM', 
      content: `Available commands:
!help - Shows this message
!stats - Shows bot statistics
!ping - Checks bot latency
!play - Plays music`
    }
  ]
};

// Define a route to render the dashboard
app.get('/', (req, res) => {
  res.render('index', sampleData);
});

// Route for the commands page
app.get('/commands', (req, res) => {
  res.render('commands');
});

// Route for the user settings page
app.get('/user-settings', (req, res) => {
  res.render('user-settings');
});

// Route for the support page
app.get('/support', (req, res) => {
  res.render('support');
});

// Start the Express server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

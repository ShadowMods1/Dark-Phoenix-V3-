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
    { username: 'admin', timestamp: '12:30 PM', content: 'Welcome to the dashboard!' },
    { username: 'user1', timestamp: '12:31 PM', content: 'Looking forward to using this feature!' },
    { username: 'user2', timestamp: '12:32 PM', content: 'Any updates on the new features?' }
  ]
};

// Define a route to render the dashboard
app.get('/', (req, res) => {
  res.render('dashboard', sampleData);
});

// Define additional routes as needed
app.get('/home', (req, res) => {
  res.send('Home page content');
});

app.get('/settings', (req, res) => {
  res.send('Settings page content');
});

app.get('/profile', (req, res) => {
  res.send('Profile page content');
});

// Start the Express server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

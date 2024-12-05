// Importing necessary modules
const express = require('express');
const path = require('path');

// Initialize Express application
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files (like stylesheets, images, etc.) from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware to handle POST requests
app.use(express.urlencoded({ extended: true }));

// Sample data to pass into the EJS template
let forumPosts = [
  {
    id: 1,
    username: 'User1',
    content: 'This is the first post!',
    replies: [
      { username: 'User2', content: 'This is a reply to the first post.' },
    ],
  },
  {
    id: 2,
    username: 'User3',
    content: 'Another post here.',
    replies: [
      { username: 'User1', content: 'Replying to the second post.' },
    ],
  },
];

// Bot settings object
let botSettings = {
  botName: 'Dark Phoenix',
  botPrefix: '!',
  welcomeMessage: 'Welcome to Dark Phoenix!',
};

// Route to render the dashboard
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Dashboard',
    logoName: 'My Dashboard',
    navLinks: [
      { href: '/home', text: 'Home' },
      { href: '/settings', text: 'Settings' },
      { href: '/profile', text: 'Profile' },
    ],
    stats: [
      { label: 'Users', value: '159' },
      { label: 'Posts', value: '3500' },
      { label: 'Comments', value: '12000' },
    ],
    quickActions: [
      { text: 'Add New Post', class: 'btn-primary' },
      { text: 'Manage Users', class: 'btn-secondary' },
    ],
    channels: [
      { name: 'General', active: true },
      { name: 'Help', active: false },
      { name: 'Feedback', active: false },
    ],
    messages: [
      { username: '5hadow_pho3nix', timestamp: '12:30 PM', content: 'Welcome to the dashboard!' },
      { username: 'AFRIENDLYHACKER', timestamp: '12:31 PM', content: 'Use !help for a list of commands!' },
      { username: 'Random_User123', timestamp: '12:32 PM', content: '!help' },
      { username: 'Dark Phoenix(V3)', timestamp: '12:32 PM', content: `Available commands:
        !help - Shows this message
        !stats - Shows bot statistics
        !ping - Checks bot latency` },
    ],
  });
});

// Route for the commands page
app.get('/commands', (req, res) => {
  res.render('commands');
});

// Route for the user settings page (GET)
app.get('/user-settings', (req, res) => {
  res.render('user-settings', { botSettings });
});

// Route to handle settings updates (POST)
app.post('/user-settings', (req, res) => {
  const { botName, botPrefix, welcomeMessage } = req.body;

  // Update bot settings with new values
  botSettings = {
    botName: botName || botSettings.botName,
    botPrefix: botPrefix || botSettings.botPrefix,
    welcomeMessage: welcomeMessage || botSettings.welcomeMessage,
  };

  // Render updated settings page with new settings
  res.render('user-settings', { botSettings });
});

// Route for the support page
app.get('/support', (req, res) => {
  res.render('support');
});

// Forum page where posts and replies are displayed
app.get('/forum', (req, res) => {
  res.render('forum', { forumPosts });
});

// Route to handle new posts submission
app.post('/forum', (req, res) => {
  const { username, content } = req.body;
  const newPost = {
    id: forumPosts.length + 1,
    username,
    content,
    replies: [],
  };
  forumPosts.push(newPost);
  res.redirect('/forum');
});

// Route to handle new replies submission
app.post('/forum/reply/:postId', (req, res) => {
  const { username, content } = req.body;
  const postId = req.params.postId;
  const post = forumPosts.find(post => post.id === parseInt(postId));
  
  if (post) {
    post.replies.push({ username, content });
  }

  res.redirect('/forum');
});

// Start the Express server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

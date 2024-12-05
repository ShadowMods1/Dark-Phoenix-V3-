const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (like images, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse form data (if needed)
app.use(express.urlencoded({ extended: true }));

// Route for the home page
app.get('/', (req, res) => {
  res.render('home');
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

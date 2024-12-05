const express = require('express');
const app = express();
const path = require('path');

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
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

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

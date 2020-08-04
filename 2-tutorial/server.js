const express = require('express');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line import/no-extraneous-dependencies
  require('dotenv').config();
}

// json body parser
app.use(express.json());

app.get('/', async (req, res, next) => {
  res.json({ message: 'Welcome to lesson 2 👋🏻' });
});

app.use('/users', require('./routes/users'));

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 8000;

// Start Server
app.listen(port, () => {
  console.log(`Server started on port: ${port}...`);
});

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
}

function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);
  if (process.env.NODE_ENV === 'production') {
    res.json({
      message: err.message
    });
  } else {
    res.json({
      message: err.message,
      stack: err.stack
    });
  }
}

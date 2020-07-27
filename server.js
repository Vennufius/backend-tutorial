const express = require('express');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line import/no-extraneous-dependencies
  require('dotenv').config();
}

// json body parser
app.use(express.json());

app.get('/', async (req, res, next) => {
  const { message } = req.query; // query parametru urlissa: google.com?message=Hello World (välilyönnit saattaa myös olla unicode %20: message=Hello%20World)
  //const message = req.query.message; Sama asia. "Destructuring" https://hacks.mozilla.org/2015/05/es6-in-depth-destructuring/

  if(message) return res.json({ message: `Your message was: ${message}.` });
  // `Your message was: ${message}`  sama asia kun 'Your message was: ' + message. "Template string". https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals

  const error = new Error('No message found.'); // Luodaan uusi error
  res.status(422); // annetaan errorille status koodi
  next(error);
});

app.use('/test', require('./routes/test'));
app.use('/users', require('./routes/users'));

app.use(notFound); // jos ei millekään endpointille tule osumia
app.use(errorHandler); // error handler middleware (jos next sisältää errorin, tämä catchaa sen)

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

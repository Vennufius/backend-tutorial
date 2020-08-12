const express = require('express');
const { checkTokenSetUser, isLoggedIn } = require('./middleware/auth');
const httpsRedirect = require('./middleware/https-redirect');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line import/no-extraneous-dependencies
  require('dotenv').config();
}

// json body parser
app.use(express.json());

// custom middleware
app.use(checkTokenSetUser);

// Security middleware
app.disable('x-powered-by');

// Redirects http requests to https
const httpsPort = app.get('https-port');
app.use(httpsRedirect({ httpsPort }));

app.set('trust proxy', true);

// HTTP security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1;mode=block');
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "script-src 'self'; style-src 'self'");
  next();
});

app.get('/', async (req, res, next) => {
  res.json({ message: 'Welcome to lesson 3 👋🏻' });
});

app.use('/auth', require('./routes/auth'));
app.use('/users', isLoggedIn, require('./routes/users'));

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

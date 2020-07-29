const express = require('express');

const router = express.Router();

// url alkaa aina /test ---> esim. /test/called (katso server.js)

router.get('/', async (req, res, next) => {
  res.json({ message: '/test route' });
});

router.get('/called', async (req, res, next) => {
  res.json({ message: `I am getting called! 🥳` });
});

router.get('/:message', async (req, res, next) => { // paramsien kanssa kannattaa olla varovainen sillä koodi menee läpi ylhäältä alas ja tämä sisältää routen kaikki mahdolliset endpointit
  const { message } = req.params;

  if (message) return res.json({ message: `Your message was: ${message}.` });

  const error = new Error('Message not found.');
  res.status(404);
  return next(error);
});

router.get('/notcalled', async (req, res, next) => {
  res.json({ message: `I'm not getting called! 😢` });
});

module.exports = router;

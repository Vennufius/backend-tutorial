const express = require('express');

const router = express.Router();

// Ei ole kunnon tietokantaa joten loin ns. feikki tietokannan (vain tiedosto missä json dataa)
const db = require('../fake-db');

// Route /users (katso server.js)

// CRUD example (Create, Read, Update, Delete)

// Read
router.get('/', async (req, res, next) => {
  res.json(db.users);
});

// Read
// hyvä use case paramsille
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  const user = db.users.find((dbUser) => dbUser.id === +id);
  if (user) return res.json(user);

  const error = new Error('User not found.');
  res.status(404);
  return next(error);
});

router.get('/name/:name', async (req, res, next) => {
  const { name } = req.params;

  const user = db.users.find((dbUser) => dbUser.name === name);
  if (user) return res.json({ user, message: 'kivaa 🥳' });

  const error = new Error('User not found.');
  res.status(404);
  return next(error);
});

// Create
router.post('/', async (req, res, next) => {
  const { name, age } = req.body;

  // Tässä usein käytettäisiin jotain input validation kirjastoa. (tarvittavat fieldit, tyypit kunnossa, muut custom validaatiot esim iän range, nimen pituus)
  if (!name || !age) {
    const error = new Error('Not all required fields are defined.');
    res.status(422);
    return next(error);
  }

  const idArray = db.users.map((dbUser) => dbUser.id);// map palauttaa saman mittaisen arrayn, mutta tässä palautetaan arvoksi vain käyttäjien id:t.
  const id = Math.max(...idArray) + 1; // ... on "Spread operator" https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  const newUser = {
    id, name, age
  };
  db.users.push(newUser);
  return res.json({ message: `User: ${name} added successfully with id: ${id}!` });
});

// Update
router.post('/change-name', async (req, res, next) => {
  const { id, newName } = req.body;
  if (!newName) {
    const error = new Error('New name not defined.');
    res.status(422);
    return next(error);
  }

  const user = db.users.find((dbUser) => dbUser.id === +id);
  if (!user) {
    const error = new Error('User not found.');
    res.status(404);
    return next(error);
  }

  user.name = newName;
  return res.json({ message: `User: ${id} name changed to ${newName}.` });
});

// Delete
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  const userIndex = db.users.findIndex((dbUser) => dbUser.id === +id); // + merkki id:n edessä pakoittaa id:n numeroksi, sillä params ei anna id:lle numero tyyppiä ja === vaatii sekä arvon, että tyypin olevan samat
  if (userIndex === -1) { // findIndex palauttaa -1, mikäli id:llä ei löydy käyttäjää.
    const error = new Error('User not found.');
    res.status(404);
    return next(error);
  }
  // koska users.splice palauttaa arrayn poistetuista arvoista ja tiedetään, että poistettiin vain yksi arvo, voidaan deletedUser ottaa palautetun arrayn ensimmäisestä indeksistä "Array Destructuring"
  const [deletedUser] = db.users.splice(userIndex, 1);

  // sama kuin
  // const deletedUsersArray = db.users.splice(userIndex, 1);
  // const deletedUser = deletedUsersArray[0];

  return res.json({ message: `User: ${deletedUser.name} deleted successfully.` });
});

module.exports = router;

const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const knex = require('../config/db');

const router = express.Router();

const userSchema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().min(0).max(200).required()
});

// CRUD example (Create, Read, Update, Delete)
// Read All
router.get('/', async (req, res, next) => {
  const users = await knex('users');
  res.json(users);
});

// Read One
// hyvä use case paramsille
router.get('/:uuid', async (req, res, next) => {
  const { uuid } = req.params;

  const [user] = await knex('users').where({ uuid });
  if (user) return res.json(user);

  const error = new Error('User not found.');
  res.status(404);
  return next(error);
});

// Create
router.post('/', async (req, res, next) => {
  const { name, age } = req.body;

  try {
    const uuid = uuidv4();
    await userSchema.validate(req.body);
    knex('users').insert({ uuid, name, age });
    return res.json({ message: `User: ${name} added successfully with id: ${uuid}!` });
  } catch (error) {
    res.status(422);
    return next(error);
  }
});

// // Update
// router.put('/:id', async (req, res, next) => {
//   const { id, newName } = req.body;
//   if (!newName) {
//     const error = new Error('New name not defined.');
//     res.status(422);
//     return next(error);
//   }

//   const user = db.users.find((dbUser) => dbUser.id === +id);
//   if (!user) {
//     const error = new Error('User not found.');
//     res.status(404);
//     return next(error);
//   }

//   user.name = newName;
//   return res.json({ message: `User: ${id} name changed to ${newName}.` });
// });

// // Delete
// router.delete('/:id', async (req, res, next) => {
//   const { id } = req.params;
//   const userIndex = db.users.findIndex((dbUser) => dbUser.id === +id); // + merkki id:n edessä pakoittaa id:n numeroksi, sillä params ei anna id:lle numero tyyppiä ja === vaatii sekä arvon, että tyypin olevan samat
//   if (userIndex === -1) { // findIndex palauttaa -1, mikäli id:llä ei löydy käyttäjää.
//     const error = new Error('User not found.');
//     res.status(404);
//     return next(error);
//   }
//   // koska users.splice palauttaa arrayn poistetuista arvoista ja tiedetään, että poistettiin vain yksi arvo, voidaan deletedUser ottaa palautetun arrayn ensimmäisestä indeksistä "Array Destructuring"
//   const [deletedUser] = db.users.splice(userIndex, 1);

//   // sama kuin
//   // const deletedUsersArray = db.users.splice(userIndex, 1);
//   // const deletedUser = deletedUsersArray[0];

//   return res.json({ message: `User: ${deletedUser.name} deleted successfully.` });
// });

module.exports = router;

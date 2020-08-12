const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { NotFoundError } = require('../handlers/error');
const queries = require('../db/queries');

const router = express.Router();

const userSchema = Joi.object({
  username: Joi.string().min(3).max(35).required(),
  password: Joi.number().min(5).max(200).required()
});

// CRUD example (Create, Read, Update, Delete)
// Read All
router.get('/', async (req, res, next) => {
  const users = await queries.getAllUsers();
  res.json(users);
});

// Read One
router.get('/me', async (req, res, next) => {
  const { uuid } = req.user;

  const user = await queries.getOneUser(uuid);
  if (user) return res.json(user);

  const error = new NotFoundError('User not found.');
  res.status(404);
  return next(error);
});

// Create ==> Moved to auth/register
// router.post('/', async (req, res, next) => {
//   const { name, age } = req.body;

//   try {
//     const uuid = uuidv4();
//     await userSchema.validateAsync(req.body);
//     const newUser = { uuid, name, age };
//     await queries.insertUser(newUser);
//     return res.json(newUser);
//   } catch (error) {
//     res.status(422);
//     return next(error);
//   }
// });

// Update
router.put('/password', async (req, res, next) => {
  const { uuid, username } = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    await userSchema.validateAsync({ username, password: newPassword });
    const user = await queries.getOneUser(uuid); // check if user is found
    if (!user) throw new Error('Unauthorized');

    const match = await bcrypt.compare(oldPassword, user.password.toString()); // check if the user password matches the password in db
    if (!match) throw new Error('Unauthorized');

    const hash = await bcrypt.hash(newPassword, process.env.SALT);
    const updatedValues = { password: hash };
    const userFound = await queries.updateUser(uuid, updatedValues); // palauttaa 0 (ei löydy käyttäjää) tai 1 (kun käyttäjä löytyy)
    if (userFound) return res.json(updatedValues);
    throw new NotFoundError('User not found.');
  } catch (error) {
    if (error.message.includes('Unathorized')) {
      res.status(401);
    } else {
      res.status(422);
    }
    return next(error);
  }
});

// Delete
router.delete('/', async (req, res, next) => {
  const { uuid } = req.user;
  try {
    const userFound = await queries.deleteUser(uuid);
    if (userFound) return res.json({ deletedUser: uuid });
    throw new NotFoundError('User not found.');
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404);
    } else {
      res.status(422);
    }
    return next(error);
  }
});

module.exports = router;

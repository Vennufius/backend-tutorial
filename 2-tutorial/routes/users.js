const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError } = require('../handlers/error');
const queries = require('../db/queries');

const router = express.Router();

const userSchema = Joi.object({
  name: Joi.string().min(3).max(35).required(),
  age: Joi.number().min(0).max(200).required()
});

// CRUD example (Create, Read, Update, Delete)
// Read All
router.get('/', async (req, res, next) => {
  const users = await queries.getAllUsers();
  res.json(users);
});

// Read One
router.get('/:uuid', async (req, res, next) => {
  const { uuid } = req.params;

  const user = await queries.getOneUser(uuid);
  if (user) return res.json(user);

  const error = new NotFoundError('User not found.');
  res.status(404);
  return next(error);
});

// Create
router.post('/', async (req, res, next) => {
  const { name, age } = req.body;

  try {
    const uuid = uuidv4();
    await userSchema.validateAsync(req.body);
    await queries.insertUser({ uuid, name, age });
    return res.json({ uuid, name, age });
  } catch (error) {
    res.status(422);
    return next(error);
  }
});

// Update
router.put('/:uuid', async (req, res, next) => {
  const { uuid } = req.params;
  const { name, age } = req.body;
  try {
    await userSchema.validateAsync(req.body);
    const userFound = await queries.updateUser(uuid, { name, age });
    if (userFound) return res.json({ name, age });
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

// Delete
router.delete('/:uuid', async (req, res, next) => {
  const { uuid } = req.params;
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

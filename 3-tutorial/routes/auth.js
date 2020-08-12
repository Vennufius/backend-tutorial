const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const queries = require('../db/queries');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

const userSchema = Joi.object({
  username: Joi.string().min(3).max(35).required(),
  password: Joi.string().min(5).max(200).required()
});

router.post('/register', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const uuid = uuidv4();
    await userSchema.validateAsync(req.body);
    const user = await queries.getOneUserWithUsername(username);
    if (user) throw new Error('Username taken.');
    // Crypt the password (Unlike facebook 🙃)
    const hash = await bcrypt.hash(password, process.env.SALT);
    // We save the password hash as binary to the db. (Katso: <date>create-users.js)
    const newUser = { uuid, username: username.toLowerCase(), password: hash };
    await queries.insertUser(newUser);
    return res.json({ uuid, username: newUser.username }); // We don't want to send the hash back to the user.
  } catch (error) {
    res.status(422);
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await queries.getOneUserWithUsername(username);
    // If no user, throw error. The error is vague by design, to prevent reverse engineering user data.
    if (!user) throw new Error('Invalid credentials.');
    // Make sure the password matches to the db password. Also change the db password type to string, since it was saved in a binary format.
    const match = await bcrypt.compare(password, user.password.toString());
    if (!match) throw new Error('Invalid credentials.'); // sama juttu täällä, ei haluta sanoa, että väärä salasana
    // payload is the data encoded into jwt (katso: checkTokenSetUser => req.user)
    const payload = {
      user_uuid: user.uuid,
      username: user.username
    };

    const token = generateAccessToken(payload);
    return res.json({ token, user: payload });
  } catch (error) {
    return next(error);
  }
});

router.delete('/logout', isLoggedIn, async (req, res, next) => {
  const { user_uuid } = req.user;
  const { token } = req;

  try {
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    // check if the payload user_uuid is the same as the req.user.user_uuid, since the req.user.user_uuid is decoded payload of the auth token.
    if (payload.user_uuid === user_uuid) {
      try {
        await queries.insertAndUpdateBlacklist({ token, expires: payload.exp });
        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    }
    res.status(401);
    throw new Error('Unauthorized');
  } catch (error) {
    return next(error);
  }
});

function generateAccessToken(payload) {
  // Create access token git it a payload. TOKEN_SECRET is a signature that is used to encrypt/decrypt the token. We also se the expiry.
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1d' });
}

module.exports = router;

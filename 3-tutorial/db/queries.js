const knex = require('./knex');

module.exports = {
  getAllUsers() {
    // valitaan vain uuid ja username, sillä ei haluta näyttää käyttäjälle password hashia.
    return knex('users').select('username');
  },
  async getOneUser(uuid) {
    const [user] = await knex('users').select('uuid', 'username').where({ uuid });
    return user;
  },
  async getOneUserWithUsername(username) {
    const [user] = await knex('users').where({ username });
    return user;
  },
  insertUser(user) {
    return knex('users').insert(user);
  },
  updateUser(uuid, user) {
    return knex('users').where({ uuid }).update(user);
  },
  deleteUser(uuid) {
    return knex('users').where({ uuid }).del();
  },
  async insertAndUpdateBlacklist(blacklistItem) {
    await knex('jwt_blacklist').insert(blacklistItem);
    // Insert token to blacklist and check if there are expired tokens and delete them from blacklist since they wont work anyway (don't want to bloat the db)
    await knex('jwt_blacklist').where('expires', '<=', new Date().getTime() / 1000).del();
  },
  getAllJwtBlacklist() {
    return knex('jwt_blacklist');
  }
};

const knex = require('./knex');

module.exports = {
  getAllUsers() {
    return knex('users');
  },
  async getOneUser(uuid) {
    const [user] = await knex('users').where({ uuid });
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
  }
};

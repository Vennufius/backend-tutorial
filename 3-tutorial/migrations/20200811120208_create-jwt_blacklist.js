exports.up = function (knex) {
  return knex.schema.createTable('jwt_blacklist', (table) => {
    table.increments('id').primary();
    table.string('token').notNullable();
    table.datetime('expires').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('jwt_blacklist');
};

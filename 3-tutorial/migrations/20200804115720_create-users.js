exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.string('uuid', 36).notNullable().primary();
    table.string('username', 36).notNullable();
    table.binary('password', 60).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};

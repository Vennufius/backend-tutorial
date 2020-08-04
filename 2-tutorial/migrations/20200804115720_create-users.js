
exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.string('uuid', 36).notNullable().primary();
    table.string('name', 36).notNullable();
    table.integer('age').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};

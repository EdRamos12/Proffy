import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('class_comment', table => {
        table.increments('id').primary();
        table.integer('user_id').notNullable().references('id').inTable('users').onUpdate('CASCADE').onDelete('CASCADE');
        table.integer('class_id').notNullable().references('id').inTable('classes').onUpdate('CASCADE').onDelete('CASCADE');
        table.string('content').notNullable();
        table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP')).notNullable();
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('class_comment');
}
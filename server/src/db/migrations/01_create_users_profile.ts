import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('profile', table => {
        table.increments('id').primary();
        table.string('avatar').notNullable();
        table.string('whatsapp').nullable();
        table.string('bio').nullable();
        table.integer('user_id').notNullable().references('id').inTable('users').onUpdate('CASCADE').onDelete('CASCADE');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('profile');
}
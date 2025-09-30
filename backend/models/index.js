const { Sequelize } = require('sequelize');
const NoteModel = require('./note');

const sequelize = new Sequelize(process.env.MYSQL_URL || 'mysql://jake:1234@localhost:3306/offline_sync_db', {
  logging: false,
});

const Note = NoteModel(sequelize);

module.exports = { sequelize, Note };
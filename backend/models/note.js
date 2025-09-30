const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Note', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    createdAtClient: { type: DataTypes.DATE, allowNull: true },
    clientLocalId: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'notes',
    timestamps: true,
    updatedAt: false
  });
};
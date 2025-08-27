'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    user_id: DataTypes.INTEGER,
    type: DataTypes.STRING,
    payload_json: DataTypes.TEXT,
    is_read: DataTypes.BOOLEAN
  }, {});
  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'user_id' });
  };
  return Notification;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    user_id: DataTypes.INTEGER,
    refresh_token_hash: DataTypes.STRING,
    expires_at: DataTypes.DATE
  }, {});
  Session.associate = (models) => {
    Session.belongsTo(models.User, { foreignKey: 'user_id' });
  };
  return Session;
};

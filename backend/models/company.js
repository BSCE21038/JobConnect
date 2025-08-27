'use strict';
module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    user_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    logo_url: DataTypes.STRING,
    website: DataTypes.STRING,
    contact_email: DataTypes.STRING,
    contact_phone: DataTypes.STRING
  }, {});
  Company.associate = (models) => {
    Company.belongsTo(models.User, { foreignKey:'user_id' });
    Company.hasMany(models.Job, { foreignKey:'company_id' });
  };
  return Company;
};

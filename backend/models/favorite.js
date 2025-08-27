'use strict';
module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    seeker_id: DataTypes.INTEGER,
    job_id: DataTypes.INTEGER
  }, {});

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.Job, { foreignKey: 'job_id' });          // <—
    Favorite.belongsTo(models.JobSeeker, { foreignKey: 'seeker_id' }); // <—
  };

  return Favorite;
};

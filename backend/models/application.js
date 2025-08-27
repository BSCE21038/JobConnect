'use strict';
module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    job_id: DataTypes.INTEGER,
    seeker_id: DataTypes.INTEGER,
    status: DataTypes.ENUM('APPLIED','SHORTLISTED','REJECTED','HIRED')
  }, {});

  Application.associate = (models) => {
    Application.belongsTo(models.Job, { foreignKey: 'job_id' });          // <—
    Application.belongsTo(models.JobSeeker, { foreignKey: 'seeker_id' }); // <—
  };

  return Application;
};

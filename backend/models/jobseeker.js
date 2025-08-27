'use strict';
module.exports = (sequelize, DataTypes) => {
  const JobSeeker = sequelize.define('JobSeeker', {
    user_id: DataTypes.INTEGER,
    headline: DataTypes.STRING,
    about: DataTypes.TEXT,
    profile_pic_url: DataTypes.STRING
  }, {});
  JobSeeker.associate = (models) => {
    JobSeeker.belongsTo(models.User, { foreignKey:'user_id' });
    JobSeeker.hasMany(models.Resume, { foreignKey:'seeker_id' });
    JobSeeker.belongsToMany(models.Skill, { through: models.JobSeekerSkill, foreignKey:'seeker_id', otherKey:'skill_id' });
    JobSeeker.belongsToMany(models.Job, { through: models.Application, foreignKey:'seeker_id', otherKey:'job_id' });
    JobSeeker.belongsToMany(models.Job, { through: models.Favorite, as:'SavedJobs', foreignKey:'seeker_id', otherKey:'job_id' });
  };
  return JobSeeker;
};

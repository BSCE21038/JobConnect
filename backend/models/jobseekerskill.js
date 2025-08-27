'use strict';
module.exports = (sequelize, DataTypes) => {
  const JobSeekerSkill = sequelize.define('JobSeekerSkill', {
    seeker_id: DataTypes.INTEGER,
    skill_id: DataTypes.INTEGER
  }, {});

  JobSeekerSkill.associate = (models) => {
    JobSeekerSkill.belongsTo(models.JobSeeker, { foreignKey: 'seeker_id' });
    JobSeekerSkill.belongsTo(models.Skill,     { foreignKey: 'skill_id' });
  };

  return JobSeekerSkill;
};

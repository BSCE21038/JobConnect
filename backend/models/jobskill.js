'use strict';
module.exports = (sequelize, DataTypes) => {
  const JobSkill = sequelize.define('JobSkill', {
    job_id: DataTypes.INTEGER,
    skill_id: DataTypes.INTEGER
  }, {});

  JobSkill.associate = (models) => {
    JobSkill.belongsTo(models.Job,   { foreignKey: 'job_id' });
    JobSkill.belongsTo(models.Skill, { foreignKey: 'skill_id' });
  };

  return JobSkill;
};

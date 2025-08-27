'use strict';
module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define('Skill', {
    name: DataTypes.STRING
  }, {});
  Skill.associate = (models) => {
    Skill.belongsToMany(models.JobSeeker, { through: models.JobSeekerSkill, foreignKey:'skill_id', otherKey:'seeker_id' });
    Skill.belongsToMany(models.Job, { through: models.JobSkill, foreignKey:'skill_id', otherKey:'job_id' });
  };
  return Skill;
};

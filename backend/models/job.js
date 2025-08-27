'use strict';
module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    company_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    location: DataTypes.STRING,
    salary_min: DataTypes.INTEGER,
    salary_max: DataTypes.INTEGER,
    job_type: DataTypes.ENUM('FULL_TIME','PART_TIME','REMOTE'),
    is_active: DataTypes.BOOLEAN,
    expires_at: DataTypes.DATE,
    jd_file_url: DataTypes.STRING
  }, {});
  Job.associate = (models) => {
    Job.belongsTo(models.Company, { foreignKey:'company_id' });
    Job.belongsToMany(models.Skill, { through: models.JobSkill, foreignKey:'job_id', otherKey:'skill_id' });
    Job.belongsToMany(models.JobSeeker, { through: models.Application, foreignKey:'job_id', otherKey:'seeker_id' });
    Job.belongsToMany(models.JobSeeker, { through: models.Favorite, as:'Fans', foreignKey:'job_id', otherKey:'seeker_id' });
  };
  return Job;
};

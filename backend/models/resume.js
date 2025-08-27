'use strict';
module.exports = (sequelize, DataTypes) => {
  const Resume = sequelize.define('Resume', {
    seeker_id: DataTypes.INTEGER,
    file_url: DataTypes.STRING,
    parsed_json: DataTypes.TEXT,
    active: DataTypes.BOOLEAN
  }, {});
  Resume.associate = (models) => {
    Resume.belongsTo(models.JobSeeker, { foreignKey:'seeker_id' });
  };
  return Resume;
};

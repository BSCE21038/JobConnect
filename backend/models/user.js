"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING, allowNull: false },
      role: { type: DataTypes.ENUM("EMPLOYER", "SEEKER"), allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      avatar_url: DataTypes.STRING,
    },
    {}
  );
  User.associate = (models) => {
    User.hasOne(models.Company, { foreignKey: "user_id" });
    User.hasOne(models.JobSeeker, { foreignKey: "user_id" });
  };
  return User;
};

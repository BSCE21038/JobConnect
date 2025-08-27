'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: { allowNull:false, autoIncrement:true, primaryKey:true, type:Sequelize.INTEGER },
      email: { type:Sequelize.STRING, allowNull:false, unique:true },
      password_hash: { type:Sequelize.STRING, allowNull:false },
      role: { type:Sequelize.ENUM('EMPLOYER','SEEKER'), allowNull:false },
      name: { type:Sequelize.STRING, allowNull:false },
      avatar_url: { type:Sequelize.STRING },
      createdAt: { allowNull:false, type:Sequelize.DATE, defaultValue:Sequelize.fn('NOW') },
      updatedAt: { allowNull:false, type:Sequelize.DATE, defaultValue:Sequelize.fn('NOW') }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";'); // safe for PG; MySQL ignores
  }
};

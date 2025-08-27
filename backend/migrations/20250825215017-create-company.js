'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Companies', {
      id:{ allowNull:false, autoIncrement:true, primaryKey:true, type:Sequelize.INTEGER },
      user_id:{ type:Sequelize.INTEGER, allowNull:false,
        references:{ model:'Users', key:'id' }, onDelete:'CASCADE' },
      name:{ type:Sequelize.STRING, allowNull:false },
      logo_url:{ type:Sequelize.STRING },
      website:{ type:Sequelize.STRING },
      contact_email:{ type:Sequelize.STRING },
      contact_phone:{ type:Sequelize.STRING },
      createdAt:{ allowNull:false, type:Sequelize.DATE, defaultValue:Sequelize.fn('NOW') },
      updatedAt:{ allowNull:false, type:Sequelize.DATE, defaultValue:Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('Companies',['user_id']);
  },
  async down(q){ await q.dropTable('Companies'); }
};

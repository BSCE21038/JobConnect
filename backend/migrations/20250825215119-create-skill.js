'use strict';
module.exports = {
  async up(q, S){
    await q.createTable('Skills',{
      id:{ allowNull:false, autoIncrement:true, primaryKey:true, type:S.INTEGER },
      name:{ type:S.STRING, allowNull:false, unique:true },
      createdAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') },
      updatedAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') }
    });
  },
  async down(q){ await q.dropTable('Skills'); }
};

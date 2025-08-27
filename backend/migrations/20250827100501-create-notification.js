'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('Notifications', {
      id:{ allowNull:false, autoIncrement:true, primaryKey:true, type:S.INTEGER },
      user_id:{ type:S.INTEGER, allowNull:false, references:{ model:'Users', key:'id' }, onDelete:'CASCADE' },
      type:{ type:S.STRING, allowNull:false },
      payload_json:{ type:S.TEXT, allowNull:false },
      is_read:{ type:S.BOOLEAN, defaultValue:false },
      createdAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') },
      updatedAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') }
    });
    await q.addIndex('Notifications',['user_id','is_read']);
  },
  async down(q){ await q.dropTable('Notifications'); }
};

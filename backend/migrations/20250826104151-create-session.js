'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('Sessions', {
      id:{ allowNull:false, autoIncrement:true, primaryKey:true, type:S.INTEGER },
      user_id:{ type:S.INTEGER, allowNull:false,
        references:{ model:'Users', key:'id' }, onDelete:'CASCADE' },
      refresh_token_hash:{ type:S.STRING, allowNull:false },
      expires_at:{ type:S.DATE, allowNull:false },
      createdAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') },
      updatedAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') }
    });
    await q.addIndex('Sessions', ['user_id']);
  },
  async down(q){ await q.dropTable('Sessions'); }
};

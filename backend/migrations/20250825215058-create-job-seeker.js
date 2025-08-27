'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('JobSeekers', {
      id:{ allowNull:false, autoIncrement:true, primaryKey:true, type:S.INTEGER },
      user_id:{ type:S.INTEGER, allowNull:false,
        references:{ model:'Users', key:'id' }, onDelete:'CASCADE' },
      headline:{ type:S.STRING },
      about:{ type:S.TEXT },
      profile_pic_url:{ type:S.STRING },
      createdAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') },
      updatedAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') }
    });
    await q.addIndex('JobSeekers',['user_id'],{ unique:true });
  },
  async down(q){ await q.dropTable('JobSeekers'); }
};

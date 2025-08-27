'use strict';
module.exports = {
  async up(q, S){
    await q.createTable('Favorites',{
      id:{ allowNull:false, autoIncrement:true, primaryKey:true, type:S.INTEGER },
      seeker_id:{ type:S.INTEGER, allowNull:false,
        references:{ model:'JobSeekers', key:'id' }, onDelete:'CASCADE' },
      job_id:{ type:S.INTEGER, allowNull:false,
        references:{ model:'Jobs', key:'id' }, onDelete:'CASCADE' },
      createdAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') },
      updatedAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') }
    });
    await q.addIndex('Favorites',['seeker_id','job_id'],{ unique:true });
  },
  async down(q){ await q.dropTable('Favorites'); }
};

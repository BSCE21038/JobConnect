'use strict';
module.exports = {
  async up(q, S){
    await q.createTable('Applications',{
      id:{ allowNull:false, autoIncrement:true, primaryKey:true, type:S.INTEGER },
      job_id:{ type:S.INTEGER, allowNull:false,
        references:{ model:'Jobs', key:'id' }, onDelete:'CASCADE' },
      seeker_id:{ type:S.INTEGER, allowNull:false,
        references:{ model:'JobSeekers', key:'id' }, onDelete:'CASCADE' },
      status:{ type:S.ENUM('APPLIED','SHORTLISTED','REJECTED','HIRED'), allowNull:false, defaultValue:'APPLIED' },
      createdAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') },
      updatedAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') }
    });
    await q.addIndex('Applications',['job_id']);
    await q.addIndex('Applications',['seeker_id']);
    await q.addIndex('Applications',['job_id','seeker_id'],{ unique:true }); // idempotent 1-click apply
  },
  async down(q, S){
    await q.dropTable('Applications');
  }
};

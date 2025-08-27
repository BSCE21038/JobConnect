'use strict';
module.exports = {
  async up(q, S){
    await q.createTable('JobSkills',{
      id:{ allowNull:false, autoIncrement:true, primaryKey:true, type:S.INTEGER },
      job_id:{ type:S.INTEGER, allowNull:false,
        references:{ model:'Jobs', key:'id' }, onDelete:'CASCADE' },
      skill_id:{ type:S.INTEGER, allowNull:false,
        references:{ model:'Skills', key:'id' }, onDelete:'CASCADE' },
      createdAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') },
      updatedAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') }
    });
    await q.addIndex('JobSkills',['job_id','skill_id'],{ unique:true });
  },
  async down(q){ await q.dropTable('JobSkills'); }
};

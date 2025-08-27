'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('Resumes', {
      id:{ allowNull:false, autoIncrement:true, primaryKey:true, type:S.INTEGER },
      seeker_id:{ type:S.INTEGER, allowNull:false,
        references:{ model:'JobSeekers', key:'id' }, onDelete:'CASCADE' },
      file_url:{ type:S.STRING, allowNull:false },
      parsed_json:{ type:S.TEXT },  // store JSON as TEXT in MySQL
      active:{ type:S.BOOLEAN, defaultValue:true },
      createdAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') },
      updatedAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') }
    });
    await q.addIndex('Resumes',['seeker_id']);
  },
  async down(q){ await q.dropTable('Resumes'); }
};

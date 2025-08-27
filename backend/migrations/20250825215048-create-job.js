'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('Jobs', {
      id:{ allowNull:false, autoIncrement:true, primaryKey:true, type:S.INTEGER },
      company_id:{ type:S.INTEGER, allowNull:false,
        references:{ model:'Companies', key:'id' }, onDelete:'CASCADE' },
      title:{ type:S.STRING, allowNull:false },
      description:{ type:S.TEXT, allowNull:false },
      location:{ type:S.STRING },
      salary_min:{ type:S.INTEGER },
      salary_max:{ type:S.INTEGER },
      job_type:{ type:S.ENUM('FULL_TIME','PART_TIME','REMOTE'), allowNull:false, defaultValue:'FULL_TIME' },
      is_active:{ type:S.BOOLEAN, defaultValue:true },
      expires_at:{ type:S.DATE },
      jd_file_url:{ type:S.STRING },
      createdAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') },
      updatedAt:{ allowNull:false, type:S.DATE, defaultValue:S.fn('NOW') }
    });
    await q.addIndex('Jobs',['company_id']);
    // FULLTEXT (MySQL InnoDB 5.6+)
    await q.sequelize.query('ALTER TABLE `Jobs` ADD FULLTEXT `jobs_fulltext` (`title`, `description`, `location`);');
  },
  async down(q, S){
    await q.dropTable('Jobs');
    // drop enum only relevant on PG; MySQL ignores
    try { await q.sequelize.query('DROP INDEX `jobs_fulltext` ON `Jobs`;'); } catch(e){}
  }
};

'use strict';
module.exports = {
  async up(q, S) {
    await q.addColumn('Jobs', 'views_count', { type: S.INTEGER, allowNull: false, defaultValue: 0 });
  },
  async down(q) {
    await q.removeColumn('Jobs', 'views_count');
  }
};

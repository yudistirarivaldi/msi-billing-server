'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    
    const hashedPassword1 = await bcrypt.hash('admin123', saltRounds);
    const hashedPassword2 = await bcrypt.hash('user123', saltRounds);
    
    await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@billing.com',
        password: hashedPassword1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'user1',
        email: 'user1@billing.com',
        password: hashedPassword2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};

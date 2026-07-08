'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const rawDataPath = path.join(__dirname, '../kode_pp_billing.json');
    const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'));

    const departmentsToInsert = [];
    const teamsToInsert = [];
    
    let currentDeptId = null;
    let teamsCountInCurrentDept = 0;

    for (const item of rawData) {
      const parts = item.kode_parts.map(Number);
      
      const hasDiv = parts[2] > 0;
      const hasDept = parts[3] > 0;
      
      const nonZeroCount = parts.filter(p => p !== 0).length;
      
      let level = 1;
      if (nonZeroCount === 1 && hasDiv) {
        level = 1;
      } else if (nonZeroCount === 2 && hasDiv && hasDept) {
        level = 2;
      } else if (nonZeroCount > 2) {
        level = 3;
      }

      const id = uuidv4();

      if (level === 1 || level === 2) {
        // Treat as Department
        currentDeptId = id;
        teamsCountInCurrentDept = 0;
        
        departmentsToInsert.push({
          id: id,
          department_code: item.kode_full,
          name: item.nama_unit,
          
          created_at: new Date(),
          updated_at: new Date()
        });
      } else if (level === 3) {
        // Treat as Team
        if (teamsCountInCurrentDept >= 3 || !currentDeptId) {
          continue; // max 3 teams per dept for dummy data, or skip if no parent
        }
        
        teamsToInsert.push({
          id: id,
          team_code: item.kode_full,
          name: item.nama_unit,
          department_id: currentDeptId,
                    created_at: new Date(),
          updated_at: new Date()
        });
        teamsCountInCurrentDept++;
      }
    }

    await queryInterface.bulkDelete('master_teams', null, {});
    await queryInterface.bulkDelete('master_departments', null, {});
    
    if (departmentsToInsert.length > 0) {
        await queryInterface.bulkInsert('master_departments', departmentsToInsert, {});
    }
    if (teamsToInsert.length > 0) {
        await queryInterface.bulkInsert('master_teams', teamsToInsert, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('master_teams', null, {});
    await queryInterface.bulkDelete('master_departments', null, {});
  }
};

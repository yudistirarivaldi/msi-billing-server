const fs = require('fs');
let code = fs.readFileSync('src/features/master/MasterTeams.vue', 'utf8');

// Remove monthly_quota from the table headers
code = code.replace(/<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Monthly Quota<\/th>/g, '');

// Remove monthly_quota from the table body
code = code.replace(/<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{{ formatRupiah\(team\.monthly_quota\) }}<\/td>/g, '');
code = code.replace(/<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{{ team.monthly_quota \? formatRupiah\(team.monthly_quota\) : '-' }}<\/td>/g, '');
code = code.replace(/<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{{ formatRupiah\(team.monthly_quota\) }}<\/td>/g, '');
// Wait, in my previous edit I might have used a different header, let's just use string replacement on the exact code.

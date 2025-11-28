const fs = require('fs');
const path = require('path');

function readJsonReport(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function generateCombinedReport() {
  const environments = [
    { name: 'DEMO', file: 'report/demo-results.json', summaryFile: 'report/demo-summary.json', url: process.env.DEMO_URL || 'https://demo.certified.io' },
    { name: 'EBC', file: 'report/ebc-results.json', summaryFile: 'report/ebc-summary.json', url: process.env.EBC_URL || 'https://ebc.certified.io' },
    { name: 'ETRAINING', file: 'report/etraining-results.json', summaryFile: 'report/etraining-summary.json', url: process.env.ETRAINING_URL || 'https://etraining45512.certified.io' }
  ];

  const combinedResults = {
    timestamp: new Date().toISOString(),
    environments: {},
    summary: {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0
    }
  };

  environments.forEach(env => {
    const json = readJsonReport(env.file);
    const summaryData = readJsonReport(env.summaryFile) || {};
    if (json) {
      const stats = json.stats || {};
      const passed = stats.expected || 0;
      const failed = (stats.unexpected || 0) + (stats.flaky || 0);
      const total = passed + failed;

      combinedResults.environments[env.name] = {
        status: failed === 0 ? 'PASSED' : 'FAILED',
        passed,
        failed,
        total,
        tests: json.suites || [],
        summary: summaryData,
        url: env.url
      };

      combinedResults.summary.totalTests += total;
      combinedResults.summary.totalPassed += passed;
      combinedResults.summary.totalFailed += failed;
    } else {
      combinedResults.environments[env.name] = {
        status: 'ERROR',
        passed: 0,
        failed: 0,
        total: 0,
        tests: [],
        summary: summaryData,
        url: env.url
      };
    }
  });

  // Write combined report
  fs.writeFileSync('report/combined-results.json', JSON.stringify(combinedResults, null, 2));
  
  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Certification Health Check Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f0f0; padding: 20px; border-radius: 5px; }
        .environment { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { background-color: #d4edda; border-color: #c3e6cb; }
        .failed { background-color: #f8d7da; border-color: #f5c6cb; }
        .error { background-color: #fff3cd; border-color: #ffeaa7; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .status { font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Certification Health Check Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Overall Status:</strong> 
          ${combinedResults.summary.totalFailed === 0 ? '✅ ALL SYSTEMS HEALTHY' : '❌ ISSUES DETECTED'}
        </p>
        <p><strong>Total Tests:</strong> ${combinedResults.summary.totalTests} 
          (${combinedResults.summary.totalPassed} passed, ${combinedResults.summary.totalFailed} failed)
        </p>
    </div>

    ${Object.entries(combinedResults.environments).map(([envName, envData]) => `
      <div class="environment ${envData.status.toLowerCase()}">
        <h2>${envName} Environment - ${envData.status}</h2>
        <p><strong>Tests:</strong> ${envData.passed}/${envData.total} passed</p>
        <p><strong>URL:</strong> ${envData.url}</p>
        <p><strong>Expected Certifications:</strong> ${envData.summary?.expectedCertifications?.length || 0}</p>
        <p><strong>Missing Certifications:</strong> ${envData.summary?.missingCertifications?.length ? envData.summary.missingCertifications.join(', ') : 'None'}</p>
        <p><strong>Logo:</strong> ${envData.summary?.logo ? `${envData.summary.logo.matched ? '✅' : '❌'} Expected ${envData.summary.logo.expected || 'N/A'}, Actual ${envData.summary.logo.actual || 'N/A'}` : 'N/A'}</p>
      </div>
    `).join('')}

    <div class="environment">
      <h2>📋 Test Details</h2>
      <p>Each environment test validates:</p>
      <ul>
        <li>✅ Registration form loads correctly</li>
        <li>✅ Personal information fields are fillable</li>
        <li>✅ Certification dropdown opens successfully</li>
        <li>✅ All expected certification options are visible</li>
        <li>✅ Certification selection works properly</li>
        <li>✅ No registration completion (test stops at certification step)</li>
      </ul>
    </div>
</body>
</html>
  `;

  fs.writeFileSync('report/health-check-report.html', html);
  console.log('Combined report generated successfully');
}

generateCombinedReport();

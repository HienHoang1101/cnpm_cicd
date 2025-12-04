/**
 * Test Metrics Exporter for Prometheus
 * Exports test results (pass/fail/skip) as Prometheus metrics
 * 
 * This allows monitoring test results in Grafana dashboards
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9091;

// Store test metrics
let testMetrics = {
  lastRun: null,
  services: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    coverage: 0
  },
  history: []
};

// Parse Jest JSON report
function parseJestReport(reportPath, serviceName) {
  try {
    if (!fs.existsSync(reportPath)) {
      console.log(`Report not found: ${reportPath}`);
      return null;
    }

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    const metrics = {
      service: serviceName,
      timestamp: new Date().toISOString(),
      numTotalTests: report.numTotalTests || 0,
      numPassedTests: report.numPassedTests || 0,
      numFailedTests: report.numFailedTests || 0,
      numPendingTests: report.numPendingTests || 0,
      numTodoTests: report.numTodoTests || 0,
      success: report.success || false,
      startTime: report.startTime,
      duration: 0,
      testSuites: {
        total: report.numTotalTestSuites || 0,
        passed: report.numPassedTestSuites || 0,
        failed: report.numFailedTestSuites || 0
      },
      testResults: []
    };

    // Calculate duration
    if (report.testResults && report.testResults.length > 0) {
      const endTimes = report.testResults.map(r => r.endTime || 0);
      const maxEndTime = Math.max(...endTimes);
      metrics.duration = maxEndTime - report.startTime;
    }

    // Extract individual test results
    if (report.testResults) {
      report.testResults.forEach(suite => {
        if (suite.assertionResults) {
          suite.assertionResults.forEach(test => {
            metrics.testResults.push({
              name: test.fullName || test.title,
              status: test.status, // passed, failed, pending
              duration: test.duration || 0,
              failureMessages: test.failureMessages || []
            });
          });
        }
      });
    }

    return metrics;
  } catch (error) {
    console.error(`Error parsing report ${reportPath}:`, error.message);
    return null;
  }
}

// Parse coverage report
function parseCoverageReport(coveragePath) {
  try {
    if (!fs.existsSync(coveragePath)) {
      return null;
    }

    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    
    if (coverage.total) {
      return {
        lines: coverage.total.lines?.pct || 0,
        statements: coverage.total.statements?.pct || 0,
        functions: coverage.total.functions?.pct || 0,
        branches: coverage.total.branches?.pct || 0
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing coverage:', error.message);
    return null;
  }
}

// Load all test reports
function loadAllReports() {
  const reportsDir = process.env.REPORTS_DIR || path.join(__dirname, '../../test-reports');
  const services = ['auth', 'order', 'restaurant', 'payment', 'notification'];
  
  let totalTests = 0, passedTests = 0, failedTests = 0, skippedTests = 0;
  let totalDuration = 0;
  
  services.forEach(service => {
    const reportPath = path.join(reportsDir, `${service}-results.json`);
    const metrics = parseJestReport(reportPath, service);
    
    if (metrics) {
      testMetrics.services[service] = metrics;
      totalTests += metrics.numTotalTests;
      passedTests += metrics.numPassedTests;
      failedTests += metrics.numFailedTests;
      skippedTests += metrics.numPendingTests;
      totalDuration += metrics.duration;
    }
  });

  // Load coverage
  const coveragePath = path.join(reportsDir, 'coverage-summary.json');
  const coverage = parseCoverageReport(coveragePath);
  
  testMetrics.summary = {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    skipped: skippedTests,
    duration: totalDuration,
    coverage: coverage ? coverage.lines : 0,
    coverageDetails: coverage
  };
  
  testMetrics.lastRun = new Date().toISOString();
  
  // Add to history (keep last 100 entries)
  testMetrics.history.push({
    timestamp: testMetrics.lastRun,
    summary: { ...testMetrics.summary }
  });
  if (testMetrics.history.length > 100) {
    testMetrics.history.shift();
  }
}

// Prometheus metrics endpoint
app.get('/metrics', (req, res) => {
  loadAllReports();
  
  let metrics = '';
  
  // Test counts
  metrics += '# HELP test_total Total number of tests\n';
  metrics += '# TYPE test_total gauge\n';
  metrics += `test_total ${testMetrics.summary.total}\n\n`;
  
  metrics += '# HELP test_passed Number of passed tests\n';
  metrics += '# TYPE test_passed gauge\n';
  metrics += `test_passed ${testMetrics.summary.passed}\n\n`;
  
  metrics += '# HELP test_failed Number of failed tests\n';
  metrics += '# TYPE test_failed gauge\n';
  metrics += `test_failed ${testMetrics.summary.failed}\n\n`;
  
  metrics += '# HELP test_skipped Number of skipped tests\n';
  metrics += '# TYPE test_skipped gauge\n';
  metrics += `test_skipped ${testMetrics.summary.skipped}\n\n`;
  
  // Pass rate
  const passRate = testMetrics.summary.total > 0 
    ? (testMetrics.summary.passed / testMetrics.summary.total) * 100 
    : 0;
  metrics += '# HELP test_pass_rate Percentage of tests passing\n';
  metrics += '# TYPE test_pass_rate gauge\n';
  metrics += `test_pass_rate ${passRate.toFixed(2)}\n\n`;
  
  // Duration
  metrics += '# HELP test_duration_ms Total test duration in milliseconds\n';
  metrics += '# TYPE test_duration_ms gauge\n';
  metrics += `test_duration_ms ${testMetrics.summary.duration}\n\n`;
  
  // Coverage
  metrics += '# HELP test_coverage_percent Code coverage percentage\n';
  metrics += '# TYPE test_coverage_percent gauge\n';
  metrics += `test_coverage_percent ${testMetrics.summary.coverage}\n\n`;
  
  // Per-service metrics
  metrics += '# HELP test_service_total Tests per service\n';
  metrics += '# TYPE test_service_total gauge\n';
  
  metrics += '# HELP test_service_passed Passed tests per service\n';
  metrics += '# TYPE test_service_passed gauge\n';
  
  metrics += '# HELP test_service_failed Failed tests per service\n';
  metrics += '# TYPE test_service_failed gauge\n';
  
  Object.entries(testMetrics.services).forEach(([service, data]) => {
    metrics += `test_service_total{service="${service}"} ${data.numTotalTests}\n`;
    metrics += `test_service_passed{service="${service}"} ${data.numPassedTests}\n`;
    metrics += `test_service_failed{service="${service}"} ${data.numFailedTests}\n`;
  });
  
  // Coverage breakdown
  if (testMetrics.summary.coverageDetails) {
    const cov = testMetrics.summary.coverageDetails;
    metrics += '\n# HELP test_coverage_lines Line coverage percentage\n';
    metrics += '# TYPE test_coverage_lines gauge\n';
    metrics += `test_coverage_lines ${cov.lines}\n`;
    
    metrics += '# HELP test_coverage_statements Statement coverage percentage\n';
    metrics += '# TYPE test_coverage_statements gauge\n';
    metrics += `test_coverage_statements ${cov.statements}\n`;
    
    metrics += '# HELP test_coverage_functions Function coverage percentage\n';
    metrics += '# TYPE test_coverage_functions gauge\n';
    metrics += `test_coverage_functions ${cov.functions}\n`;
    
    metrics += '# HELP test_coverage_branches Branch coverage percentage\n';
    metrics += '# TYPE test_coverage_branches gauge\n';
    metrics += `test_coverage_branches ${cov.branches}\n`;
  }
  
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

// JSON endpoint for detailed results
app.get('/api/test-results', (req, res) => {
  loadAllReports();
  res.json(testMetrics);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'test-metrics-exporter' });
});

// Endpoint to receive test results (POST from CI/CD)
app.use(express.json());
app.post('/api/report', (req, res) => {
  const { service, results } = req.body;
  
  if (service && results) {
    testMetrics.services[service] = {
      ...results,
      timestamp: new Date().toISOString()
    };
    
    // Recalculate summary
    let total = 0, passed = 0, failed = 0, skipped = 0;
    Object.values(testMetrics.services).forEach(s => {
      total += s.numTotalTests || 0;
      passed += s.numPassedTests || 0;
      failed += s.numFailedTests || 0;
      skipped += s.numPendingTests || 0;
    });
    
    testMetrics.summary = { total, passed, failed, skipped };
    testMetrics.lastRun = new Date().toISOString();
    
    res.json({ success: true, message: 'Report received' });
  } else {
    res.status(400).json({ error: 'Invalid report format' });
  }
});

// History endpoint
app.get('/api/history', (req, res) => {
  res.json(testMetrics.history);
});

// Failed tests endpoint
app.get('/api/failed-tests', (req, res) => {
  loadAllReports();
  
  const failedTests = [];
  Object.entries(testMetrics.services).forEach(([service, data]) => {
    if (data.testResults) {
      data.testResults
        .filter(t => t.status === 'failed')
        .forEach(t => {
          failedTests.push({
            service,
            name: t.name,
            duration: t.duration,
            failureMessages: t.failureMessages
          });
        });
    }
  });
  
  res.json(failedTests);
});

app.listen(PORT, () => {
  console.log(`📊 Test Metrics Exporter running on port ${PORT}`);
  console.log(`   Prometheus metrics: http://localhost:${PORT}/metrics`);
  console.log(`   Test results API: http://localhost:${PORT}/api/test-results`);
  console.log(`   Failed tests: http://localhost:${PORT}/api/failed-tests`);
});

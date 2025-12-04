/**
 * Custom Jest Reporter - Exports test results to Test Metrics Exporter
 * 
 * Usage in jest.config.js:
 * reporters: ['default', '<rootDir>/tests/reporters/metrics-reporter.js']
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

class MetricsReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};
    this._exporterUrl = process.env.TEST_METRICS_URL || 'http://localhost:9091';
    this._serviceName = process.env.SERVICE_NAME || 'unknown';
    this._reportsDir = process.env.REPORTS_DIR || path.join(process.cwd(), 'test-reports');
  }

  onRunComplete(contexts, results) {
    const testResults = {
      service: this._serviceName,
      timestamp: new Date().toISOString(),
      numTotalTests: results.numTotalTests,
      numPassedTests: results.numPassedTests,
      numFailedTests: results.numFailedTests,
      numPendingTests: results.numPendingTests,
      numTodoTests: results.numTodoTests || 0,
      success: results.success,
      startTime: results.startTime,
      duration: Date.now() - results.startTime,
      testSuites: {
        total: results.numTotalTestSuites,
        passed: results.numPassedTestSuites,
        failed: results.numFailedTestSuites
      },
      testResults: []
    };

    // Extract individual test results
    results.testResults.forEach(suite => {
      if (suite.testResults) {
        suite.testResults.forEach(test => {
          testResults.testResults.push({
            name: test.fullName || test.title,
            status: test.status,
            duration: test.duration || 0,
            failureMessages: test.failureMessages || []
          });
        });
      }
    });

    // Save to file
    this._saveToFile(testResults);

    // Send to metrics exporter
    this._sendToExporter(testResults);

    // Print summary
    this._printSummary(testResults);
  }

  _saveToFile(results) {
    try {
      if (!fs.existsSync(this._reportsDir)) {
        fs.mkdirSync(this._reportsDir, { recursive: true });
      }

      const filePath = path.join(this._reportsDir, `${this._serviceName}-results.json`);
      fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
      console.log(`\n📊 Test results saved to: ${filePath}`);
    } catch (error) {
      console.error('Failed to save test results:', error.message);
    }
  }

  _sendToExporter(results) {
    const url = new URL(`${this._exporterUrl}/api/report`);
    const protocol = url.protocol === 'https:' ? https : http;

    const data = JSON.stringify({
      service: this._serviceName,
      results: results
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 5000
    };

    const req = protocol.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('📤 Test results sent to metrics exporter');
      } else {
        console.log(`⚠️ Metrics exporter returned status: ${res.statusCode}`);
      }
    });

    req.on('error', (error) => {
      // Silently fail if exporter is not running
      if (this._options.verbose) {
        console.log(`ℹ️ Could not reach metrics exporter: ${error.message}`);
      }
    });

    req.on('timeout', () => {
      req.destroy();
    });

    req.write(data);
    req.end();
  }

  _printSummary(results) {
    const passRate = results.numTotalTests > 0
      ? ((results.numPassedTests / results.numTotalTests) * 100).toFixed(1)
      : 0;

    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST METRICS SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Service:     ${results.service}`);
    console.log(`Total:       ${results.numTotalTests} tests`);
    console.log(`Passed:      ${results.numPassedTests} ✅`);
    console.log(`Failed:      ${results.numFailedTests} ${results.numFailedTests > 0 ? '❌' : '✅'}`);
    console.log(`Skipped:     ${results.numPendingTests}`);
    console.log(`Pass Rate:   ${passRate}%`);
    console.log(`Duration:    ${(results.duration / 1000).toFixed(2)}s`);
    console.log('═'.repeat(60));

    if (results.numFailedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      results.testResults
        .filter(t => t.status === 'failed')
        .forEach(t => {
          console.log(`  • ${t.name}`);
          if (t.failureMessages && t.failureMessages.length > 0) {
            console.log(`    ${t.failureMessages[0].split('\n')[0]}`);
          }
        });
    }
  }
}

module.exports = MetricsReporter;

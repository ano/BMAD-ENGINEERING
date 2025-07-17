#!/usr/bin/env node
const { lintArchitecture } = require('./lib/architecture-linter');

const args = process.argv.slice(2);
const configFile = args[0] || 'architecture-rules.yaml';

try {
  lintArchitecture({ configFile });
  console.log('Architecture lint passed');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

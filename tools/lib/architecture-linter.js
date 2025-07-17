const fs = require('fs');
const path = require('path');

/**
 * Lint architecture and safety rules
 * @param {object} options
 * @param {string} options.rootDir - repository root
 * @param {string} options.configFile - architecture rule config
 */
function lintArchitecture(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const configFile = options.configFile || 'architecture-rules.yaml';

  const coreConfigPath = path.join(rootDir, 'bmad-core', 'core-config.yaml');
  if (!fs.existsSync(coreConfigPath)) {
    throw new Error('Missing bmad-core/core-config.yaml');
  }

  const coreContent = fs.readFileSync(coreConfigPath, 'utf8');
  const archSettings = {
    architectureFile: (coreContent.match(/architectureFile:\s*(.*)/) || [])[1],
    architectureSharded: /architectureSharded:\s*true/.test(coreContent),
    architectureShardedLocation: (coreContent.match(/architectureShardedLocation:\s*(.*)/) || [])[1]
  };
  const archFile = path.join(rootDir, archSettings.architectureFile || 'docs/architecture.md');

  let failed = false;

  if (!fs.existsSync(archFile)) {
    console.error(`\u274c Architecture file not found: ${archSettings.architectureFile}`);
    failed = true;
  }

  if (archSettings.architectureSharded) {
    const shardDir = path.join(rootDir, archSettings.architectureShardedLocation || '');
    if (!fs.existsSync(shardDir)) {
      console.error(`\u274c Architecture shard directory missing: ${archSettings.architectureShardedLocation}`);
      failed = true;
    }
  }

  const rulesPath = path.join(rootDir, configFile);
  let rules = {};
  if (fs.existsSync(rulesPath)) {
    const ruleContent = fs.readFileSync(rulesPath, 'utf8');
    const match = ruleContent.match(/requireCriticalRule:\s*(.*)/);
    if (match) {
      rules.requireCriticalRule = match[1].trim() === 'true';
    }
  }

  if (rules.requireCriticalRule && fs.existsSync(archFile)) {
    const content = fs.readFileSync(archFile, 'utf8');
    if (!content.includes('<critical_rule>')) {
      console.error(`\u274c ${archSettings.architectureFile} must contain '<critical_rule>' markers`);
      failed = true;
    }
  }

  if (failed) {
    throw new Error('Architecture lint failed');
  }
}

module.exports = { lintArchitecture };

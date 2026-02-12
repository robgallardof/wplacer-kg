import { execSync } from 'node:child_process';

const checks = [
    { name: 'Server syntax', cmd: 'node --check server.js' },
    { name: 'Core painting contract tests', cmd: 'node --test tests/server-painting-contract.test.mjs' },
    { name: 'Paint engine unit tests', cmd: 'node --test tests/paint-engine.unit.test.mjs' },
    { name: 'Paint engine integration tests', cmd: 'node --test tests/paint-engine.integration.test.mjs' },
];

for (const check of checks) {
    process.stdout.write(`\n[prestart] ${check.name}\n`);
    execSync(check.cmd, { stdio: 'inherit' });
}

process.stdout.write('\n[prestart] All checks passed.\n');

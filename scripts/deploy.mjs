#!/usr/bin/env node

import { spawn } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Ready to deploy to GitHub Pages');
console.log('This will push the contents of dist/ to your gh-pages branch.\n');

rl.question('Proceed with deployment? (y/n): ', (answer) => {
  rl.close();

  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n✓ Deploying...\n');
    
    const deploy = spawn('gh-pages', ['-d', 'dist', '--dotfiles'], {
      stdio: 'inherit',
      shell: true
    });

    deploy.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Deployment successful!');
      } else {
        console.error(`\n❌ Deployment failed with exit code ${code}`);
        process.exit(code);
      }
    });
  } else {
    console.log('\n❌ Deployment cancelled.');
    process.exit(0);
  }
});

#!/usr/bin/env node

'use strict';

const fs   = require('fs');
const path = require('path');

const pkg  = require('../package.json');
const arg  = process.argv[2];

if (arg === '--version' || arg === '-v') {
  console.log(pkg.version);
  process.exit(0);
}

if (arg === '--help' || arg === '-h') {
  printHelp();
  process.exit(0);
}

// Any other argument (or no argument) → run init
init();

// ─────────────────────────────────────────────────────────────────────────────

function init() {
  const cwd    = process.cwd();
  const pkgDir = path.join(__dirname, '..');
  const sddeDir = path.join(cwd, '.sdd-de');

  console.log('');
  console.log('SDD-DE — Spec-Driven Development for Design Engineers');
  console.log('─'.repeat(54));

  // 1. Copy skills into .sdd-de/ai-specs/skills/
  const skillsSrc = path.join(pkgDir, 'ai-specs', 'skills');
  const skillsDst = path.join(sddeDir, 'ai-specs', 'skills');
  copyDir(skillsSrc, skillsDst);
  console.log('  ✓  skills installed  →  .sdd-de/ai-specs/skills/');

  // 2. Copy spec templates + standards into .sdd-de/docs/
  const docsSrc = path.join(pkgDir, 'docs');
  const docsDst = path.join(sddeDir, 'docs');
  copyDir(docsSrc, docsDst);
  console.log('  ✓  docs installed    →  .sdd-de/docs/');

  // 3. Write CLAUDE.md to project root
  const claudeSrc = path.join(pkgDir, 'CLAUDE.md');
  const claudeDst = path.join(cwd, 'CLAUDE.md');
  if (fs.existsSync(claudeDst)) {
    console.log('  ⚠  CLAUDE.md already exists — skipped');
    console.log('     To activate skills, add the contents of .sdd-de/../CLAUDE.md manually.');
  } else {
    fs.copyFileSync(claudeSrc, claudeDst);
    console.log('  ✓  CLAUDE.md created →  ./CLAUDE.md');
  }

  // 4. Add .sdd-de/ to .gitignore if a .gitignore exists
  const gitignorePath = path.join(cwd, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    if (!content.includes('.sdd-de')) {
      fs.appendFileSync(
        gitignorePath,
        '\n# SDD-DE toolkit (installed via npx sdd-de)\n.sdd-de/\n'
      );
      console.log('  ✓  .gitignore updated');
    }
  }

  console.log('');
  console.log('Ready. Open Claude Code in this directory and run:');
  console.log('');
  console.log('  /enrich-brief          transform a brief into a spec-ready story');
  console.log('  /generate-artifacts    generate Component, Interaction, and Page specs');
  console.log('  /visual-verify         compare live implementation to Figma');
  console.log('  /sync-tokens           sync Figma Variables and CSS custom properties');
  console.log('  /commit                push a PR with the spec as description');
  console.log('');
}

// ─────────────────────────────────────────────────────────────────────────────

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

function printHelp() {
  console.log('');
  console.log(`sdd-de v${pkg.version}`);
  console.log('');
  console.log('Usage:');
  console.log('  npx sdd-de           Install SDD-DE into the current project');
  console.log('');
  console.log('What it installs:');
  console.log('  .sdd-de/ai-specs/skills/   Claude Code slash commands');
  console.log('    /enrich-brief            /generate-artifacts');
  console.log('    /visual-verify           /sync-tokens   /commit');
  console.log('  .sdd-de/docs/              spec templates + standards');
  console.log('  CLAUDE.md                  activates skills in Claude Code');
  console.log('');
  console.log('Options:');
  console.log('  -v, --version        Print version number');
  console.log('  -h, --help           Print this help');
  console.log('');
}

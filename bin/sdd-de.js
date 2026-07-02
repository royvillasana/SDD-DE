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
init().catch(err => {
  console.error('\n  Error:', err.message);
  process.exit(1);
});

// ─────────────────────────────────────────────────────────────────────────────

async function init() {
  // Load @clack/prompts dynamically (ESM package, works via dynamic import in Node ≥18)
  let clack;
  try {
    clack = await import('@clack/prompts');
  } catch {
    console.error('\n  @clack/prompts not found. Run: npm install @clack/prompts\n');
    process.exit(1);
  }

  const { intro, outro, select, text, note, isCancel, cancel, spinner: spin } = clack;

  // ── Header ────────────────────────────────────────────────────────────────
  printBanner();
  intro(`SDD-DE  v${pkg.version}  —  Spec-Driven Development for Design Engineers`);
  console.log('');

  // ─────────────────────────────────────────────────────────────────────────
  // Q1 — Framework
  // ─────────────────────────────────────────────────────────────────────────
  const framework = await select({
    message: 'Which framework is this project using?',
    options: [
      { value: 'react',      label: 'React',      hint: 'Vite / CRA' },
      { value: 'next',       label: 'Next.js',    hint: 'App Router' },
      { value: 'vue',        label: 'Vue 3' },
      { value: 'nuxt',       label: 'Nuxt 3' },
      { value: 'svelte',     label: 'Svelte' },
      { value: 'sveltekit',  label: 'SvelteKit' },
      { value: 'angular',    label: 'Angular' },
      { value: 'astro',      label: 'Astro' },
      { value: 'vanilla',    label: 'Vanilla',    hint: 'HTML / CSS / JS' },
    ],
  });
  if (isCancel(framework)) return cancelSetup(cancel);

  // ─────────────────────────────────────────────────────────────────────────
  // Q2 — Language
  // ─────────────────────────────────────────────────────────────────────────
  const language = await select({
    message: 'Which language?',
    options: [
      { value: 'typescript', label: 'TypeScript' },
      { value: 'javascript', label: 'JavaScript' },
    ],
  });
  if (isCancel(language)) return cancelSetup(cancel);

  // ─────────────────────────────────────────────────────────────────────────
  // Q3 — Design System Source  ⚡ KEY BIFURCATION
  // ─────────────────────────────────────────────────────────────────────────
  const designSource = await select({
    message: 'Where do your components and design specs come from?',
    options: [
      {
        value: 'figma',
        label: 'Figma',
        hint: 'Use Figma MCP to read frames, variables, and component specs',
      },
      {
        value: 'library',
        label: 'Component Library',
        hint: 'shadcn/ui, Material UI, Ant Design, Chakra UI, Mantine…',
      },
      {
        value: 'github',
        label: 'GitHub Repository',
        hint: 'A repo that contains your component library or design system',
      },
      {
        value: 'zip',
        label: 'ZIP File',
        hint: 'A ZIP archive containing your components',
      },
      {
        value: 'stitch',
        label: 'Google Stitch',
        hint: 'Google\'s AI design tool — connect via Stitch MCP or exported ZIP',
      },
    ],
  });
  if (isCancel(designSource)) return cancelSetup(cancel);

  // ─────────────────────────────────────────────────────────────────────────
  // Branch A — Figma
  // ─────────────────────────────────────────────────────────────────────────
  let figmaFileUrl = '';
  let figmaTokenCollection = '';
  let componentLibrary = '';

  if (designSource === 'figma') {
    figmaFileUrl = await text({
      message: 'Figma file URL',
      placeholder: 'https://www.figma.com/design/...',
      validate(val) {
        if (val && !val.startsWith('https://')) return 'Must be a full https:// URL';
      },
    });
    if (isCancel(figmaFileUrl)) return cancelSetup(cancel);
    figmaFileUrl = figmaFileUrl || '';

    figmaTokenCollection = await text({
      message: 'Figma variable collection name (holds design tokens)',
      placeholder: 'Tokens',
      defaultValue: 'Tokens',
    });
    if (isCancel(figmaTokenCollection)) return cancelSetup(cancel);
    figmaTokenCollection = figmaTokenCollection || 'Tokens';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Branch B — Component Library
  // ─────────────────────────────────────────────────────────────────────────
  if (designSource === 'library') {
    componentLibrary = await select({
      message: 'Which component library?',
      options: [
        { value: 'shadcn',     label: 'shadcn/ui',    hint: 'Radix UI + Tailwind CSS' },
        { value: 'radix',      label: 'Radix UI',     hint: 'unstyled primitives' },
        { value: 'mui',        label: 'Material UI',  hint: 'MUI — Emotion-based' },
        { value: 'antd',       label: 'Ant Design' },
        { value: 'chakra',     label: 'Chakra UI',    hint: 'Emotion-based' },
        { value: 'mantine',    label: 'Mantine' },
        { value: 'headlessui', label: 'Headless UI',  hint: 'Tailwind Labs' },
        { value: 'other',      label: 'Other' },
      ],
    });
    if (isCancel(componentLibrary)) return cancelSetup(cancel);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Branch C — GitHub Repository
  // ─────────────────────────────────────────────────────────────────────────
  let githubRepoUrl = '';
  let githubBranch = '';
  let githubComponentDir = '';

  if (designSource === 'github') {
    githubRepoUrl = await text({
      message: 'GitHub repository URL',
      placeholder: 'https://github.com/org/design-system',
      validate(val) {
        if (!val) return 'Repository URL is required';
        if (!val.startsWith('https://github.com/')) return 'Must be a full https://github.com/ URL';
      },
    });
    if (isCancel(githubRepoUrl)) return cancelSetup(cancel);

    githubBranch = await text({
      message: 'Branch name',
      placeholder: 'main',
      defaultValue: 'main',
    });
    if (isCancel(githubBranch)) return cancelSetup(cancel);
    githubBranch = githubBranch || 'main';

    githubComponentDir = await text({
      message: 'Component directory path inside the repo',
      placeholder: 'src/components',
      defaultValue: 'src/components',
    });
    if (isCancel(githubComponentDir)) return cancelSetup(cancel);
    githubComponentDir = githubComponentDir || 'src/components';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Branch D — ZIP File
  // ─────────────────────────────────────────────────────────────────────────
  let zipFilePath = '';
  let zipComponentDir = '';

  if (designSource === 'zip') {
    zipFilePath = await text({
      message: 'Path to the ZIP file (absolute or relative to project root)',
      placeholder: './design-system.zip',
      validate(val) {
        if (!val) return 'ZIP file path is required';
        if (!val.endsWith('.zip')) return 'File must be a .zip archive';
      },
    });
    if (isCancel(zipFilePath)) return cancelSetup(cancel);

    zipComponentDir = await text({
      message: 'Component directory path inside the ZIP',
      placeholder: 'src/components',
      defaultValue: 'src/components',
    });
    if (isCancel(zipComponentDir)) return cancelSetup(cancel);
    zipComponentDir = zipComponentDir || 'src/components';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Branch E — Google Stitch
  // ─────────────────────────────────────────────────────────────────────────
  let stitchConnection = '';
  let stitchApiKey = '';
  let stitchProjectId = '';
  let stitchZipPath = '';

  if (designSource === 'stitch') {
    stitchConnection = await select({
      message: 'How do you want to connect to Google Stitch?',
      options: [
        {
          value: 'mcp',
          label: 'Stitch MCP (recommended)',
          hint: 'Live connection — reads screen code, images, and design tokens via API',
        },
        {
          value: 'zip',
          label: 'Exported ZIP',
          hint: 'Use the design.md + screen PNGs from the Stitch dashboard export',
        },
      ],
    });
    if (isCancel(stitchConnection)) return cancelSetup(cancel);

    if (stitchConnection === 'mcp') {
      stitchApiKey = await text({
        message: 'Stitch API key  (from stitch.withgoogle.com → Settings)',
        placeholder: 'AIza...',
        validate(val) {
          if (!val || val.trim().length < 10) return 'API key is required';
        },
      });
      if (isCancel(stitchApiKey)) return cancelSetup(cancel);

      stitchProjectId = await text({
        message: 'Stitch project ID  (optional — leave blank to list projects at runtime)',
        placeholder: 'e.g. proj_abc123 or press Enter to skip',
      });
      if (isCancel(stitchProjectId)) return cancelSetup(cancel);
      stitchProjectId = stitchProjectId || '';
    }

    if (stitchConnection === 'zip') {
      stitchZipPath = await text({
        message: 'Path to the Stitch exported ZIP file',
        placeholder: './stitch-export.zip',
        validate(val) {
          if (!val) return 'ZIP file path is required';
          if (!val.endsWith('.zip')) return 'File must be a .zip archive';
        },
      });
      if (isCancel(stitchZipPath)) return cancelSetup(cancel);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Q4 — Styling Approach (with auto-suggestion)
  // ─────────────────────────────────────────────────────────────────────────
  const stylingSuggestion = autoStyling(framework, designSource, componentLibrary);

  const stylingOptions = [
    { value: 'tailwind',           label: 'Tailwind CSS' },
    { value: 'css-modules',        label: 'CSS Modules' },
    { value: 'scss',               label: 'SCSS / Sass' },
    { value: 'styled-components',  label: 'Styled Components' },
    { value: 'emotion',            label: 'Emotion' },
    { value: 'css',                label: 'Vanilla CSS' },
  ];

  // Reorder so suggested value appears first
  const orderedStyling = [
    ...stylingOptions.filter(o => o.value === stylingSuggestion),
    ...stylingOptions.filter(o => o.value !== stylingSuggestion),
  ];

  const styling = await select({
    message: `Styling approach  (${orderedStyling[0].label} suggested for your choices)`,
    options: orderedStyling,
  });
  if (isCancel(styling)) return cancelSetup(cancel);

  // ─────────────────────────────────────────────────────────────────────────
  // Q5 — Design Token File Path
  // ─────────────────────────────────────────────────────────────────────────
  const tokenDefault = autoTokenFile(framework);

  const tokenFile = await text({
    message: 'Design token file path',
    placeholder: tokenDefault,
    defaultValue: tokenDefault,
  });
  if (isCancel(tokenFile)) return cancelSetup(cancel);

  // ─────────────────────────────────────────────────────────────────────────
  // Q6 — Test Runner
  // ─────────────────────────────────────────────────────────────────────────
  const testRunner = await select({
    message: 'Test runner',
    options: [
      { value: 'vitest',     label: 'Vitest' },
      { value: 'jest',       label: 'Jest' },
      { value: 'playwright', label: 'Playwright' },
      { value: 'cypress',    label: 'Cypress' },
      { value: 'none',       label: 'None' },
    ],
  });
  if (isCancel(testRunner)) return cancelSetup(cancel);

  // ─────────────────────────────────────────────────────────────────────────
  // Install files + write project.yaml
  // ─────────────────────────────────────────────────────────────────────────
  console.log('');
  const s = spin();
  s.start('Installing SDD-DE toolkit…');

  const cwd     = process.cwd();
  const pkgDir  = path.join(__dirname, '..');
  const sddeDir = path.join(cwd, '.sdd-de');
  const componentDir = autoComponentDir(framework);

  try {
    // Skills
    copyDir(path.join(pkgDir, 'ai-specs', 'skills'), path.join(sddeDir, 'ai-specs', 'skills'));
    // Docs
    copyDir(path.join(pkgDir, 'docs'), path.join(sddeDir, 'docs'));
    // project.yaml
    fs.writeFileSync(
      path.join(sddeDir, 'project.yaml'),
      buildProjectYaml({ framework, language, styling, designSource,
                          figmaFileUrl, figmaTokenCollection,
                          componentLibrary,
                          githubRepoUrl, githubBranch, githubComponentDir,
                          zipFilePath, zipComponentDir,
                          stitchConnection, stitchApiKey, stitchProjectId, stitchZipPath,
                          tokenFile: tokenFile || tokenDefault,
                          componentDir, testRunner }),
      'utf8',
    );
    // CLAUDE.md + multi-agent companions
    const claudeSrc = path.join(pkgDir, 'CLAUDE.md');
    for (const name of ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md', 'codex.md']) {
      const dst = path.join(cwd, name);
      if (!fs.existsSync(dst)) fs.copyFileSync(claudeSrc, dst);
    }
    // .claude/skills/ symlinks
    createSymlinks(
      path.join(sddeDir, 'ai-specs', 'skills'),
      path.join(cwd, '.claude', 'skills'),
      '../../.sdd-de/ai-specs/skills',
    );
    // .cursor/skills/ symlinks (only if .cursor/ exists)
    const cursorDir = path.join(cwd, '.cursor');
    if (fs.existsSync(cursorDir)) {
      createSymlinks(
        path.join(sddeDir, 'ai-specs', 'skills'),
        path.join(cursorDir, 'skills'),
        '../../.sdd-de/ai-specs/skills',
      );
    }
    // .gitignore
    const gitignorePath = path.join(cwd, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8');
      if (!content.includes('.sdd-de')) {
        fs.appendFileSync(gitignorePath, '\n# SDD-DE toolkit\n.sdd-de/\n');
      }
    }
  } catch (err) {
    s.stop('Installation failed');
    throw err;
  }

  s.stop('SDD-DE installed');

  // ─────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────
  const designLabel =
    designSource === 'figma'    ? `Figma  →  ${figmaFileUrl || 'URL not set'}` :
    designSource === 'library'  ? `Library  →  ${componentLibrary}` :
    designSource === 'github'   ? `GitHub  →  ${githubRepoUrl} (${githubBranch}/${githubComponentDir})` :
    designSource === 'zip'      ? `ZIP  →  ${zipFilePath} (${zipComponentDir})` :
    designSource === 'stitch'   ? `Google Stitch  →  ${stitchConnection === 'mcp' ? `MCP (project: ${stitchProjectId || 'unset'})` : `ZIP: ${stitchZipPath}`}` :
    designSource;

  note(
    [
      `Framework:      ${framework}`,
      `Language:       ${language}`,
      `Styling:        ${styling}`,
      `Design source:  ${designLabel}`,
      `Token file:     ${tokenFile || tokenDefault}`,
      `Components:     ${componentDir}`,
      `Test runner:    ${testRunner}`,
    ].join('\n'),
    'Project config saved to .sdd-de/project.yaml',
  );

  note(
    [
      'Epic 1 — Component Library',
      '  Build tokens → atoms → molecules → organisms.',
      '  Run the 7-step cycle once per component.',
      '',
      'Epic 2 — Page Composition',
      '  Compose Epic 1 components into pages and features.',
      '  Run the 7-step cycle once per page.',
      '',
      '── The 7-Step Cycle (same for every component and page) ──',
      '',
      '  1  /enrich-brief       Brief → enriched story + acceptance criteria',
      '  2  /generate-artifacts Story → Component + Interaction + Page specs',
      '  3  git checkout -b     Branch before any implementation',
      '  4  Implement           One spec task at a time (mark ✓ when done)',
      '  5  /visual-verify      Compare live to spec — zero discrepancies',
      '  6  /adversarial-review Red-team: resolve all Blockers before committing',
      '  7  /sync-tokens →      Sync design tokens, then open PR with spec',
      '     /commit',
    ].join('\n'),
    'Workflow',
  );

  outro('Open Claude Code in this directory and start Epic 1 with: /enrich-brief');
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function cancelSetup(cancel) {
  cancel('Setup cancelled.');
  process.exit(0);
}

function autoStyling(framework, designSource, library) {
  if (designSource === 'library') {
    const map = { shadcn: 'tailwind', headlessui: 'tailwind', mui: 'emotion', chakra: 'emotion', mantine: 'css-modules', antd: 'scss', radix: 'css-modules' };
    if (map[library]) return map[library];
  }
  // github, zip, stitch: default to css-modules (most neutral for unknown sources)
  if (designSource === 'github' || designSource === 'zip' || designSource === 'stitch') return 'css-modules';
  const map = { next: 'tailwind', angular: 'scss', vue: 'css-modules', nuxt: 'css-modules' };
  return map[framework] || 'css-modules';
}

function autoTokenFile(framework) {
  const map = {
    next:      'app/globals.css',
    nuxt:      'assets/css/tokens.css',
    svelte:    'src/app.css',
    sveltekit: 'src/app.css',
    angular:   'src/styles/tokens.css',
    astro:     'src/styles/tokens.css',
    vanilla:   'css/tokens.css',
  };
  return map[framework] || 'src/styles/tokens.css';
}

function autoComponentDir(framework) {
  const map = {
    nuxt:      'components',
    svelte:    'src/lib/components',
    sveltekit: 'src/lib/components',
    astro:     'src/components',
  };
  return map[framework] || 'src/components';
}

function buildProjectYaml({
  framework, language, styling, designSource,
  figmaFileUrl, figmaTokenCollection,
  componentLibrary,
  githubRepoUrl, githubBranch, githubComponentDir,
  zipFilePath, zipComponentDir,
  stitchConnection, stitchApiKey, stitchProjectId, stitchZipPath,
  tokenFile, componentDir, testRunner,
}) {
  const lines = [
    '# SDD-DE Project Configuration',
    '# Generated by npx sdd-de — update any time your stack changes.',
    '# See .sdd-de/docs/framework-config.md for framework-specific guidance.',
    '',
    `framework: ${framework}`,
    `language: ${language}`,
    `styling: ${styling}`,
    '',
    '# Design system source: figma | library | github | zip | stitch',
    `design_source: ${designSource}`,
  ];

  if (designSource === 'figma') {
    lines.push(`figma_file_url: "${figmaFileUrl}"`);
    lines.push(`figma_token_collection: ${figmaTokenCollection}`);
  } else if (designSource === 'library') {
    lines.push(`component_library: ${componentLibrary}`);
  } else if (designSource === 'github') {
    lines.push(`github_repo_url: "${githubRepoUrl}"`);
    lines.push(`github_branch: ${githubBranch}`);
    lines.push(`github_component_dir: ${githubComponentDir}`);
  } else if (designSource === 'zip') {
    lines.push(`zip_file_path: "${zipFilePath}"`);
    lines.push(`zip_component_dir: ${zipComponentDir}`);
  } else if (designSource === 'stitch') {
    lines.push(`stitch_connection: ${stitchConnection}`);
    if (stitchConnection === 'mcp') {
      lines.push(`stitch_api_key: "${stitchApiKey}"`);
      lines.push(`stitch_project_id: "${stitchProjectId}"`);
    } else {
      lines.push(`stitch_zip_path: "${stitchZipPath}"`);
    }
  }

  lines.push('');
  lines.push(`token_file: ${tokenFile}`);
  lines.push(`component_dir: ${componentDir}`);
  lines.push(`test_runner: ${testRunner}`);

  return lines.join('\n') + '\n';
}

function createSymlinks(sourceDir, targetDir, relativeBase) {
  if (!fs.existsSync(sourceDir)) return;
  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const linkPath = path.join(targetDir, entry.name);
    const linkTarget = `${relativeBase}/${entry.name}`;
    if (!fs.existsSync(linkPath)) {
      try { fs.symlinkSync(linkTarget, linkPath); } catch (_) {}
    }
  }
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, dstPath);
    else fs.copyFileSync(srcPath, dstPath);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function printBanner() {
  const isTTY = process.stdout.isTTY;
  const c = isTTY ? '\x1b[96m' : '';  // cyan — main letters
  const d = isTTY ? '\x1b[36m' : '';  // dim cyan — shadow/accent
  const x = isTTY ? '\x1b[0m'  : '';  // reset

  console.log(`
${c}  ███████╗██████╗ ██████╗        ██████╗ ███████╗${x}
${c}  ██╔════╝██╔══██╗██╔══██╗       ██╔══██╗██╔════╝${x}
${c}  ███████╗██║  ██║██║  ██║${d}═══${c}   ██║  ██║█████╗  ${x}
${c}  ╚════██║██║  ██║██║  ██║       ██║  ██║██╔══╝  ${x}
${c}  ███████║██████╔╝██████╔╝${d}═══${c}   ██████╔╝███████╗${x}
${c}  ╚══════╝╚═════╝ ╚═════╝        ╚═════╝ ╚══════╝${x}
${d}  Spec-Driven Development for Design Engineers${x}
`);
}

// ─────────────────────────────────────────────────────────────────────────────

function printHelp() {
  printBanner();
  console.log(`sdd-de v${pkg.version}

Usage:
  npx sdd-de           Install SDD-DE and configure your project

──────────────────────────────────────────────────────────────
 How it works — Two Epics, One 7-Step Cycle
──────────────────────────────────────────────────────────────

  Epic 1 — Component Library
    Build the UI building blocks before composing any page.
    Order: Tokens → Atoms → Molecules → Organisms
    Run the 7-step cycle once per component.

  Epic 2 — Page Composition
    Compose Epic 1 components into pages, layouts, and features.
    Order: Templates → Pages → Features
    Run the 7-step cycle once per page or feature.

  The 7-Step Cycle (same for every component and page):

    1  /enrich-brief       Brief → enriched story + acceptance criteria
    2  /generate-artifacts Story → Component + Interaction + Page specs
    3  git checkout -b     Branch before any implementation
    4  Implement           One spec task at a time (mark ✓ when done)
    5  /visual-verify      Compare live to spec — zero discrepancies
    6  /adversarial-review Red-team: resolve all Blockers before committing
    7  /sync-tokens →      Sync design tokens, then open PR with spec
       /commit

──────────────────────────────────────────────────────────────
 What it installs
──────────────────────────────────────────────────────────────

  .sdd-de/project.yaml           framework + design system configuration
  .sdd-de/ai-specs/skills/       slash commands for Claude Code / Cursor
    /setup               /enrich-brief        /generate-artifacts
    /visual-verify       /adversarial-review  /sync-tokens  /commit
  .sdd-de/docs/                  spec templates + standards
  CLAUDE.md / AGENTS.md / GEMINI.md / codex.md
  .claude/skills/                symlinks → .sdd-de/ai-specs/skills/

──────────────────────────────────────────────────────────────
 Design system sources supported
──────────────────────────────────────────────────────────────

  Figma             — Figma MCP reads frames, variables, and component specs
  Component Library — shadcn/ui · Radix UI · Material UI · Ant Design
                      Chakra UI · Mantine · Headless UI · Other
  GitHub Repository — reads component source files directly from a repo
  ZIP File          — reads component source files from a local ZIP archive
  Google Stitch     — Google's AI design tool; via Stitch MCP or exported ZIP

Frameworks supported:
  react · next · vue · nuxt · svelte · sveltekit · angular · astro · vanilla

Options:
  -v, --version        Print version number
  -h, --help           Print this help
`);
}

'use strict';

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const { renderAgents, detectTools, TOOLS } = require('./render');

// Claude's model aliases are stable; every other tool inherits its own default until agents.models.<tool>.<tier> is set.
const DEFAULT_MODELS = { claude: { frontier: 'opus', balanced: 'sonnet', fast: 'haiku' } };

function loadConfig(cwd) {
  let user = {};
  try { user = YAML.parse(fs.readFileSync(path.join(cwd, '.sdd-de', 'project.yaml'), 'utf8')) || {}; } catch { /* no project.yaml yet */ }
  const a = user.agents || {};
  return { ...user, agents: { tools: a.tools || 'auto', models: { ...DEFAULT_MODELS, ...(a.models || {}) } } };
}

// Copies the step agents (px-*.md) next to the installed skills; the persona agents in ai-specs/agents are not step agents.
function installStepAgents(cwd, pkgDir, out = console) {
  const src = path.join(pkgDir, 'ai-specs', 'agents');
  const dst = path.join(cwd, '.sdd-de', 'ai-specs', 'agents');
  if (!fs.existsSync(src)) return [];
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src).filter((x) => x.startsWith('px-') && x.endsWith('.md'))) fs.copyFileSync(path.join(src, f), path.join(dst, f));
  const rows = renderAgents({ cwd, pkgDir: path.join(cwd, '.sdd-de'), cfg: loadConfig(cwd) });
  for (const r of rows.filter((x) => x.state !== 'written')) out.log(`  · ${r.file}  ${r.state}`);
  return rows;
}

function run(argv, out = console) {
  const sub = argv[0];
  if (!['sync', 'status'].includes(sub)) {
    out.log(`Usage: sdd-de agents sync|status [--dir <project>] [--tools claude,cursor,...]\n  Renders the step subagents (ai-specs/agents/px-*.md) into each tool's native format.\n  Tools: ${TOOLS.join(', ')}. Default: claude plus every tool whose folder exists.\n  Models per tier per tool: agents.models.<tool>.<frontier|balanced|fast> in .sdd-de/project.yaml.`);
    return sub ? 2 : 0;
  }
  const val = (f) => { const i = argv.indexOf(f); return i > -1 ? argv[i + 1] : undefined; };
  const cwd = path.resolve(val('--dir') || process.cwd());
  const cfg = loadConfig(cwd);
  const pkgDir = fs.existsSync(path.join(cwd, '.sdd-de', 'ai-specs', 'agents')) ? path.join(cwd, '.sdd-de') : path.join(__dirname, '..', '..');
  const tools = val('--tools') ? val('--tools').split(',') : undefined;
  const unknown = (tools || []).filter((t) => !TOOLS.includes(t));
  if (unknown.length) { out.log(`  Unknown tool: ${unknown.join(', ')}. Choose from: ${TOOLS.join(', ')}.`); return 2; }
  if (sub === 'status') {
    const list = tools || detectTools(cwd, cfg);
    out.log(`  tools: ${list.join(', ')}`);
    for (const t of list) {
      const m = (cfg.agents.models && cfg.agents.models[t]) || {};
      out.log(`  ${t.padEnd(9)} frontier=${m.frontier || 'inherit'}  balanced=${m.balanced || 'inherit'}  fast=${m.fast || 'inherit'}`);
    }
    return 0;
  }
  const rows = renderAgents({ cwd, pkgDir, cfg, tools });
  for (const r of rows) out.log(`  ${r.state === 'written' ? '✓' : '·'} ${r.file}  (${r.tier} → ${r.model})${r.state === 'written' ? '' : '  ' + r.state}`);
  const unpinned = [...new Set(rows.filter((r) => r.model === 'inherit' && r.tool !== 'claude').map((r) => r.tool))];
  if (unpinned.length) out.log(`\n  ${unpinned.join(', ')}: no models set, so each agent uses that tool's default model. Set agents.models.<tool>.<tier> in .sdd-de/project.yaml to pin them.`);
  return 0;
}

module.exports = { run, installStepAgents, loadConfig, DEFAULT_MODELS };

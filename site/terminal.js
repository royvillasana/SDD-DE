/* SDD-DE animated terminal — vanilla web component.
   Usage: <x-import component-from-global-scope="sdd-terminal" from="./terminal.js" script="setup" hint-size="100%,420px"></x-import>
*/
(function () {
  'use strict';

  var C = {
    bg: '#141413', bar: '#201F1E', border: '#33312E',
    text: '#FAF9F0', dim: '#B8B5A8', muted: '#787569',
    coral: '#56D4C8', green: '#9CC79C', cyan: '#8FBFD9', yellow: '#D9B36A'
  };

  /* ── Script registry ─────────────────────────────────── */
  // line types:
  //  cmd    — typed char-by-char after "$"
  //  out    — instant output line   (color, pause)
  //  gap    — blank line
  //  sel    — clack select: question, options[], choice index
  //  txt    — clack text prompt: question, typed answer
  //  spin   — spinner then success line
  //  note   — boxed note block: title, lines[]
  //  block  — pre-colored segments [[text,color],...]

  window.SDD_TERM_SCRIPTS = {

    setup: [
      { t: 'cmd', s: 'npx @royvillasana/sdd-de' },
      { t: 'gap' },
      { t: 'block', seg: [['  ▓▓▓▓▓▓▓▓▓▓▓▓▓   ░▓▓▓▓▓▓▓▓▓▓▓▓    ▓▓▓▓▓▓▓▓▓▓▓▓░           ░▓▓▓▓▓▓▓▓▓▓▓▒    ▒▓▓▓▓▓▓▓▓▓▓▓░', C.coral]] },
      { t: 'block', seg: [[' ▓▓░                          ▓▓▒             ▒▓▓          ░▓▓         ▓▓▒', C.coral]] },
      { t: 'block', seg: [[' ▓▓▒              ░▓▓          ▓▓▒ ▓▓░         ▒▓░         ░▓▓          ▓▓░', C.coral]] },
      { t: 'block', seg: [['  ▒▓▓▓▓▓▓▓▓▓▓▓▓░  ░▓▓          ▓▓▒ ▓▓░         ░▓▒  ▓▓▓▓▓  ░▓▓          ▓▓░ ▒▓▓▓▓▓▓▓▓▓▓▓░', C.coral]] },
      { t: 'block', seg: [['               ▒▓░ ░▓▓          ▓▓░ ▓▓░         ▒▓░         ░▓▓          ▓▓  ▒▓▒', C.coral]] },
      { t: 'block', seg: [['               ▒▓░ ░▓▓         ▓▓▒  ▓▓▒        ▒▓▓          ░▓▓         ▓▓▒  ▒▓▒', C.coral]] },
      { t: 'block', seg: [['  ▓▓▓▓▓▓▓▓▓▓▓▓▓▒  ░▓▓▓▓▓▓▓▓▓▓▓▓    ▓▓▓▓▓▓▓▓▓▓▓▓░           ░▓▓▓▓▓▓▓▓▓▓▓▒    ▒▓▓▓▓▓▓▓▓▓▓▓▓', C.coral]] },
      { t: 'gap' },
      { t: 'out', text: '┌  SDD-DE  v2.4.1  —  Spec-Driven Development for Design Engineers', color: C.dim, pause: 500 },
      { t: 'gap' },
      { t: 'sel', q: 'Which framework is this project using?', opts: ['React', 'Next.js', 'Vue 3', 'Svelte', 'Astro'], choice: 0 },
      { t: 'sel', q: 'Which language?', opts: ['TypeScript', 'JavaScript'], choice: 0 },
      { t: 'sel', q: 'Where do your components and design specs come from?', opts: ['Figma', 'Component Library', 'GitHub Repository', 'ZIP File', 'Google Stitch'], choice: 0 },
      { t: 'txt', q: 'Figma file URL', a: 'https://www.figma.com/design/aBc123/acme-ds' },
      { t: 'txt', q: 'Figma variable collection name (holds design tokens)', a: 'Tokens' },
      { t: 'sel', q: 'Styling approach  (Tailwind CSS suggested for your choices)', opts: ['Tailwind CSS', 'CSS Modules', 'SCSS / Sass'], choice: 0 },
      { t: 'txt', q: 'Design token file path', a: 'src/styles/tokens.css' },
      { t: 'sel', q: 'Test runner', opts: ['Vitest', 'Jest', 'Playwright', 'None'], choice: 0 },
      { t: 'gap' },
      { t: 'spin', text: 'Installing SDD-DE toolkit…', done: 'SDD-DE installed', ms: 1400 },
      { t: 'spin', text: 'Installing @google/design.md CLI…', done: '@google/design.md installed', ms: 1100 },
      { t: 'gap' },
      { t: 'note', title: 'Project config saved to .sdd-de/project.yaml', lines: [
        'Framework:      react', 'Language:       typescript', 'Styling:        tailwind',
        'Design source:  Figma  →  figma.com/design/aBc123…',
        'Token file:     src/styles/tokens.css', 'Test runner:    vitest'] },
      { t: 'gap' },
      { t: 'out', text: '└  Done. Open Claude Code in this directory and run /enrich-brief', color: C.green, pause: 400 }
    ],

    agent: [
      { t: 'cmd', s: 'claude' },
      { t: 'gap' },
      { t: 'out', text: '✻ Welcome to Claude Code', color: C.coral, pause: 600 },
      { t: 'out', text: '  Reading CLAUDE.md … SDD-DE toolkit detected (.sdd-de/)', color: C.dim, pause: 700 },
      { t: 'out', text: '  10 skills loaded: /setup /enrich-brief /generate-artifacts …', color: C.dim, pause: 700 },
      { t: 'gap' },
      { t: 'cmd', s: '/enrich-brief', prompt: '>', promptColor: C.coral },
      { t: 'cmd', s: 'Build a primary Button from this Figma frame: https://figma.com/design/aBc123?node-id=12:400', prompt: '>', promptColor: C.coral },
      { t: 'gap' },
      { t: 'out', text: '⏺ Reading Figma frame via MCP…', color: C.dim, pause: 900 },
      { t: 'out', text: '⏺ Found component Button — variants: Primary / Secondary / Ghost, sizes SM MD LG', color: C.text, pause: 900 },
      { t: 'gap' },
      { t: 'out', text: '  Enriched story written → .sdd-de/stories/button.md', color: C.green, pause: 500 },
      { t: 'out', text: '  ✓ 9 acceptance criteria · 4 states · a11y requirements included', color: C.green, pause: 400 },
      { t: 'gap' },
      { t: 'out', text: '  Next step: /generate-artifacts', color: C.coral, pause: 400 }
    ],

    artifacts: [
      { t: 'cmd', s: '/generate-artifacts', prompt: '>', promptColor: C.coral },
      { t: 'gap' },
      { t: 'out', text: '⏺ Generating spec artifacts from enriched story…', color: C.dim, pause: 900 },
      { t: 'out', text: '  ✓ Component Spec    → .sdd-de/specs/button.component.md', color: C.green, pause: 500 },
      { t: 'out', text: '  ✓ Interaction Spec  → .sdd-de/specs/button.interaction.md', color: C.green, pause: 500 },
      { t: 'out', text: '  ✓ Page Spec         → .sdd-de/specs/button.page.md', color: C.green, pause: 500 },
      { t: 'gap' },
      { t: 'cmd', s: 'git checkout -b feat/button' },
      { t: 'out', text: "Switched to a new branch 'feat/button'", color: C.dim, pause: 600 },
      { t: 'gap' },
      { t: 'out', text: '⏺ Implementing task 1 of 7 — base variants with CVA…', color: C.dim, pause: 900 },
      { t: 'out', text: '  ✓ src/components/ui/button.tsx', color: C.green, pause: 400 },
      { t: 'out', text: '  ✓ src/components/ui/button.variants.ts', color: C.green, pause: 400 },
      { t: 'out', text: '  Task 1 marked [x] — 6 remaining', color: C.text, pause: 400 }
    ],

    verify: [
      { t: 'cmd', s: '/visual-verify', prompt: '>', promptColor: C.coral },
      { t: 'gap' },
      { t: 'out', text: '⏺ Comparing live implementation to Figma spec…', color: C.dim, pause: 900 },
      { t: 'out', text: '  ✓ Padding 12px 20px matches spacing/3 spacing/5', color: C.green, pause: 350 },
      { t: 'out', text: '  ✓ Radius 8px matches radius/md', color: C.green, pause: 350 },
      { t: 'out', text: '  ✗ Hover fill #B25538 expected, found #C96442', color: '#E39A9A', pause: 700 },
      { t: 'out', text: '  Fixing → color-brand-primary-hover token applied', color: C.dim, pause: 800 },
      { t: 'out', text: '  ✓ Re-verify: 0 discrepancies', color: C.green, pause: 500 },
      { t: 'gap' },
      { t: 'cmd', s: '/adversarial-review', prompt: '>', promptColor: C.coral },
      { t: 'out', text: '⏺ Red-teaming implementation…', color: C.dim, pause: 900 },
      { t: 'out', text: '  ✓ Focus ring visible on keyboard nav', color: C.green, pause: 350 },
      { t: 'out', text: '  ✓ aria-disabled + loading state announced', color: C.green, pause: 350 },
      { t: 'out', text: '  ✓ No hardcoded hex — 100% token-referenced', color: C.green, pause: 350 },
      { t: 'out', text: '  0 Blockers · ready to commit', color: C.text, pause: 400 },
      { t: 'gap' },
      { t: 'cmd', s: '/commit', prompt: '>', promptColor: C.coral },
      { t: 'out', text: '  ✓ PR #42 opened — description: Component Spec (button)', color: C.green, pause: 400 }
    ],

    progress: [
      { t: 'out', text: '⏺ Implementing task 3 of 7 — hover + active states…', color: C.dim, pause: 1000 },
      { t: 'out', text: '  ✓ src/components/ui/button.tsx updated — tokens only, no hardcoded hex', color: C.green, pause: 700 },
      { t: 'out', text: '  Task 3 marked [x]', color: C.text, pause: 700 },
      { t: 'gap' },
      { t: 'block', seg: [['🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', C.coral]] },
      { t: 'block', seg: [['📍 Design System Component Creation — Button', C.text]] },
      { t: 'gap' },
      { t: 'out', text: '  ✅ 1. /enrich-brief', color: C.dim, pause: 160 },
      { t: 'out', text: '  ✅ 2. /generate-artifacts', color: C.dim, pause: 160 },
      { t: 'out', text: '  ✅ 3. Branch created', color: C.dim, pause: 160 },
      { t: 'block', seg: [['  👉 4. Implement (task 4 of 7)          ← you are here', C.coral]] },
      { t: 'out', text: '  ⬜ 5. /visual-verify', color: C.dim, pause: 160 },
      { t: 'out', text: '  ⬜ 6. /adversarial-review', color: C.dim, pause: 160 },
      { t: 'out', text: '  ⬜ 7. /sync-tokens → /commit', color: C.dim, pause: 160 },
      { t: 'gap' },
      { t: 'block', seg: [['  ➡️  Next step: Implement task 4 — add disabled state with aria-disabled', C.text]] },
      { t: 'block', seg: [['  💻 Run: mark task 3 as [x], then continue with task 4', C.coral]] },
      { t: 'block', seg: [['🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', C.coral]] }
    ],

    update: [
      { t: 'cmd', s: 'npx @royvillasana/sdd-de@latest update' },
      { t: 'gap' },
      { t: 'spin', text: 'Updating skills, docs, and agent config…', done: 'Toolkit updated to v2.4.1', ms: 1400 },
      { t: 'out', text: '  ✓ project.yaml preserved', color: C.green, pause: 400 },
      { t: 'out', text: '  ✓ 10 skills refreshed · 12 docs refreshed · symlinks repaired', color: C.green, pause: 400 }
    ]
  };

  /* ── Component ───────────────────────────────────────── */
  var SPIN_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  class SddTerminal extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      var title = this.getAttribute('title') || 'terminal';
      var minH = this.getAttribute('min-height') || '320px';
      this.style.display = 'block';
      this.innerHTML = '';

      var frame = document.createElement('div');
      frame.style.cssText = 'background:' + C.bg + ';border:1px solid ' + C.border + ';border-radius:12px;overflow:hidden;font-family:"JetBrains Mono",ui-monospace,monospace;box-shadow:0 20px 50px -20px rgba(20,20,19,0.45);';
      var bar = document.createElement('div');
      bar.style.cssText = 'display:flex;align-items:center;gap:8px;background:' + C.bar + ';padding:10px 14px;border-bottom:1px solid ' + C.border + ';';
      ['#CF7E7E', '#D9B36A', '#9CC79C'].forEach(function (c) {
        var d = document.createElement('span');
        d.style.cssText = 'width:11px;height:11px;border-radius:50%;background:' + c + ';opacity:0.85;';
        bar.appendChild(d);
      });
      var t = document.createElement('span');
      t.textContent = title;
      t.style.cssText = 'margin-left:8px;font-size:12px;color:' + C.muted + ';';
      bar.appendChild(t);
      var replay = document.createElement('button');
      replay.textContent = '↻ replay';
      replay.setAttribute('aria-label', 'Replay animation');
      replay.style.cssText = 'margin-left:auto;background:none;border:1px solid ' + C.border + ';color:' + C.muted + ';font-family:inherit;font-size:11px;border-radius:6px;padding:3px 10px;cursor:pointer;';
      replay.onmouseenter = function () { replay.style.color = C.text; };
      replay.onmouseleave = function () { replay.style.color = C.muted; };
      var self = this;
      replay.onclick = function () { self.restart(); };
      bar.appendChild(replay);

      this._body = document.createElement('div');
      this._body.style.cssText = 'padding:18px 20px;font-size:13px;line-height:1.75;color:' + C.text + ';height:' + minH + ';overflow-y:auto;white-space:pre-wrap;word-break:break-word;';
      frame.appendChild(bar);
      frame.appendChild(this._body);
      this.appendChild(frame);

      this._script = (window.SDD_TERM_SCRIPTS || {})[this.getAttribute('script')] || [];
      this._started = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !self._started) { self._started = true; self.play(); }
        });
      }, { threshold: 0.25 });
      io.observe(this);
    }

    restart() { this._run = (this._run || 0) + 1; this._body.innerHTML = ''; this.play(); }

    _line(color) {
      var el = document.createElement('div');
      if (color) el.style.color = color;
      this._body.appendChild(el);
      this._body.scrollTop = this._body.scrollHeight;
      return el;
    }

    _wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    async play() {
      var run = this._run = (this._run || 0) + 1;
      var body = this._body;
      body.innerHTML = '';
      var self = this;
      function alive() { return run === self._run; }

      for (var i = 0; i < this._script.length; i++) {
        if (!alive()) return;
        var step = this._script[i];

        if (step.t === 'gap') { this._line(); await this._wait(120); continue; }

        if (step.t === 'cmd') {
          var el = this._line();
          var p = document.createElement('span');
          p.textContent = (step.prompt || '$') + ' ';
          p.style.color = step.promptColor || C.muted;
          var txt = document.createElement('span');
          var caret = document.createElement('span');
          caret.textContent = '▋';
          caret.style.cssText = 'color:' + C.coral + ';animation:sddBlink 1s steps(1) infinite;';
          el.appendChild(p); el.appendChild(txt); el.appendChild(caret);
          for (var k = 0; k < step.s.length; k++) {
            if (!alive()) return;
            txt.textContent += step.s[k];
            body.scrollTop = body.scrollHeight;
            await this._wait(18 + Math.random() * 30);
          }
          await this._wait(350);
          caret.remove();
          continue;
        }

        if (step.t === 'out') {
          var o = this._line(step.color || C.text);
          o.textContent = step.text;
          await this._wait(step.pause || 300);
          continue;
        }

        if (step.t === 'block') {
          var b = this._line();
          step.seg.forEach(function (sg) {
            var s2 = document.createElement('span');
            s2.textContent = sg[0]; s2.style.color = sg[1] || C.text;
            b.appendChild(s2);
          });
          await this._wait(60);
          continue;
        }

        if (step.t === 'sel') {
          var q = this._line();
          q.innerHTML = '<span style="color:' + C.coral + '">◆</span>  <span style="color:' + C.text + '">' + esc(step.q) + '</span>';
          await this._wait(400);
          var optEls = [];
          for (var j = 0; j < step.opts.length; j++) {
            var oe = this._line(C.muted);
            oe.textContent = '│  ○ ' + step.opts[j];
            optEls.push(oe);
          }
          // cursor walk to choice
          for (var c = 0; c <= step.choice; c++) {
            if (!alive()) return;
            optEls.forEach(function (e2, idx) {
              e2.textContent = '│  ' + (idx === c ? '● ' : '○ ') + step.opts[idx];
              e2.style.color = idx === c ? C.text : C.muted;
            });
            await this._wait(280);
          }
          await this._wait(350);
          // collapse
          optEls.forEach(function (e2) { e2.remove(); });
          var ans = this._line(C.dim);
          ans.textContent = '│  ● ' + step.opts[step.choice];
          ans.style.color = C.green;
          await this._wait(250);
          continue;
        }

        if (step.t === 'txt') {
          var q2 = this._line();
          q2.innerHTML = '<span style="color:' + C.coral + '">◆</span>  <span style="color:' + C.text + '">' + esc(step.q) + '</span>';
          await this._wait(300);
          var al = this._line(C.green);
          al.textContent = '│  ';
          for (var m = 0; m < step.a.length; m++) {
            if (!alive()) return;
            al.textContent += step.a[m];
            body.scrollTop = body.scrollHeight;
            await this._wait(10 + Math.random() * 16);
          }
          await this._wait(280);
          continue;
        }

        if (step.t === 'spin') {
          var sl = this._line(C.dim);
          var f = 0;
          var start = Date.now();
          while (Date.now() - start < step.ms) {
            if (!alive()) return;
            sl.textContent = SPIN_FRAMES[f++ % SPIN_FRAMES.length] + ' ' + step.text;
            await this._wait(70);
          }
          sl.textContent = '✓ ' + step.done;
          sl.style.color = C.green;
          await this._wait(250);
          continue;
        }

        if (step.t === 'note') {
          var nt = this._line(C.dim);
          nt.textContent = '┌  ' + step.title;
          for (var n2 = 0; n2 < step.lines.length; n2++) {
            if (!alive()) return;
            var nl = this._line(C.text);
            nl.textContent = '│  ' + step.lines[n2];
            await this._wait(90);
          }
          this._line(C.dim).textContent = '└';
          await this._wait(300);
          continue;
        }
      }
      // loop
      await this._wait(4500);
      if (alive()) this.play();
    }
  }

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  if (!document.getElementById('sdd-term-kf')) {
    var st = document.createElement('style');
    st.id = 'sdd-term-kf';
    st.textContent = '@keyframes sddBlink{0%,49%{opacity:1}50%,100%{opacity:0}}';
    document.head.appendChild(st);
  }

  if (!customElements.get('sdd-terminal')) customElements.define('sdd-terminal', SddTerminal);
})();

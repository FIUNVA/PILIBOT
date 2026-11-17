/* Loading screen for PILIBOT simulators */
(function(){
  'use strict';

  const FIUNVA_SVG = `<svg viewBox="0 0 426 495" role="img" aria-label="FIUNVA">
    <path fill="#00D6EB" fill-rule="evenodd" d="M376,32 L360,88 L167,88 L165,90 L87,362 L165,244 L316,244 L316,253 L303,297 L405,167Z M179,196 L197,137 L347,138 L335,186 L330,197Z"/>
    <path fill="var(--logo-ink,#000000)" fill-rule="evenodd" d="M196,184 L322,184 L332,150 L206,150Z M365,17 L112,18 L21,348 L75,348 L151,82 L155,74 L348,74Z"/>
    <text x="213" y="472" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-style="italic" font-weight="800" font-size="132" fill="var(--logo-ink,#000000)" stroke="#00D6EB" stroke-width="7.5" stroke-linejoin="miter" paint-order="stroke fill" letter-spacing="0.03em">FIUNVA</text>
  </svg>`;

  const LOADER_CSS = `
    #loader{position:fixed;inset:0;background:var(--paper,#ffffff);z-index:9999;display:flex;align-items:center;justify-content:center;transition:opacity .6s ease,visibility .6s ease}
    #loader.hidden{opacity:0;visibility:hidden}
    .loader-stage{display:flex;flex-direction:column;align-items:center;gap:1.15rem;z-index:10;width:100%;max-width:560px;padding:0 1.5rem}
    .loader-logo{width:220px;height:auto}
    .loader-logo svg{width:100%;height:auto}
    .loader-title{font:italic 800 1.8rem/1 "Barlow Condensed",Arial Narrow,sans-serif;color:var(--ink,#000000);letter-spacing:.04em;margin-top:.5rem}
    .loader-hud-row{width:100%;display:flex;justify-content:space-between;align-items:baseline;font-family:ui-monospace,SF Mono,Menlo,monospace}
    .loader-status-msg{font-size:.78rem;color:var(--tf,#00707d);font-weight:700;letter-spacing:.5px}
    .loader-pct{font:italic 800 2.2rem/1 "Barlow Condensed",Arial Narrow,sans-serif;color:var(--logo-ink,#000000);-webkit-text-stroke:1.2px #00D6EB;paint-order:stroke fill}
    .progress-track{width:100%;height:15px;border:2px solid var(--logo-ink,#000000);background:var(--wash,#f1fbfd);transform:skewX(-16deg);padding:2px;position:relative}
    .progress-fill{height:100%;width:0%;background:linear-gradient(90deg,#1447FF,#00D6EB);transition:width .08s linear}
    .terminal-feed{width:100%;font-family:ui-monospace,SF Mono,Menlo,monospace;font-size:.72rem;color:var(--mut,#44595f);border-left:3px solid #FF6A00;padding-left:.75rem;line-height:1.5;min-height:3.4rem}
    [data-theme="dark"] #loader{background:var(--paper,#000000)}
    [data-theme="dark"] .loader-title{color:var(--ink,#f2fcfe)}
    [data-theme="dark"] .loader-status-msg{color:var(--tf,#00D6EB)}
    [data-theme="dark"] .loader-pct{color:var(--logo-ink,#f2fcfe)}
    [data-theme="dark"] .progress-track{border-color:var(--logo-ink,#f2fcfe);background:var(--wash,#071418)}
    [data-theme="dark"] .terminal-feed{color:var(--mut,#93adb3)}
  `;

  function createLoader(title) {
    const style = document.createElement('style');
    style.textContent = LOADER_CSS;
    document.head.appendChild(style);

    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.className = 'loader';
    loader.innerHTML = `
      <div class="loader-stage">
        <div id="loader-logo"></div>
        <div class="loader-title">${title || 'PILIBOT'}</div>
        <div class="loader-hud-row">
          <span class="loader-status-msg" id="sim-status">INICIANDO...</span>
          <span class="loader-pct" id="sim-pct">0%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" id="sim-bar"></div>
        </div>
        <div class="terminal-feed" id="sim-logs"></div>
      </div>
    `;
    document.body.insertBefore(loader, document.body.firstChild);

    document.getElementById('loader-logo').innerHTML = FIUNVA_SVG;
    return loader;
  }

  function updateProgress(pct, status, log) {
    const bar = document.getElementById('sim-bar');
    const pctEl = document.getElementById('sim-pct');
    const statusEl = document.getElementById('sim-status');
    const logsEl = document.getElementById('sim-logs');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
    if (statusEl && status) statusEl.textContent = status;
    if (logsEl && log) {
      const div = document.createElement('div');
      div.textContent = '> ' + log;
      logsEl.appendChild(div);
      logsEl.scrollTop = logsEl.scrollHeight;
    }
  }

  function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 600);
    }
  }

  window.PilibotLoader = { create: createLoader, update: updateProgress, hide: hideLoader };
})();
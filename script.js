/* ============================================================
   camouflagechicken — portfolio data + interactivity
   ============================================================ */

const PROJECTS = [
  {
    slug: "opuscoin", name: "OpusCoin", cat: "trading", emoji: "📈",
    gradient: "linear-gradient(135deg,#0d2b1f 0%,#161b22 100%)",
    tagline: "Autonomous Kraken BTC/USD day-trading bot",
    tech: ["Python 3.11", "asyncio", "WebSocket L2", "SQLite", "FastAPI"],
    repo: "https://github.com/camouflagechicken/opuscoin",
    why: "A production-grade Bitcoin day-trading bot for Kraken spot that ingests the live L2 order book and trade tape, then trades on detected large-player activity — spoofs, icebergs, sweeps, and stop-hunts.",
    bullets: [
      "Fail-closed asyncio lifecycle: idempotent order submission, stale-order reconciliation, crash recovery from SQLite.",
      "Order-book CRC32 integrity checks validated against the official Kraken vector.",
      "Order-flow layer: cumulative volume delta, time-windowed buy/sell ratio, Parkinson + Garman-Klass volatility.",
      "Whale detectors (spoof / sweep / iceberg / wall / stop-hunt), each with expiry and an explicit action contract.",
      "Regime classifier feeding five strategies, and a risk engine with ATR trailing stops, a profit ratchet, fractional-Kelly sizing, and circuit breakers.",
      "Calibration/backtest harness + regression suite; local FastAPI dashboard with paper mode as the default."
    ],
    code: [
      { file: "analysis/whale_detector.py", lang: "python", code:
`def _check_sweep(self, now: float, side: str):
    """A liquidity sweep = N+ distinct price levels eaten by same-side
    trades inside a short window, moving monotonically."""
    window = [t for t in self._recent_trades
              if now - t["time"] < self._sweep_time_limit and t["side"] == side]
    if len(window) < self._sweep_levels:
        return None

    prices = []
    for t in window:
        if not prices or t["price"] != prices[-1]:
            prices.append(t["price"])

    mono = all(prices[i] > prices[i - 1] for i in range(1, len(prices)))
    total_vol = sum(t["qty"] for t in window)
    if not mono or total_vol < self._sweep_min_btc:
        return None            # retail noise, not a whale

    conf = min(0.95, 0.50 + 0.25 * min(1.0, total_vol / self._sweep_min_btc))
    return self._emit(ManipulationType.LIQUIDITY_SWEEP, ...)` }
    ]
  },
  {
    slug: "squeezebot", name: "SqueezeBot", cat: "trading", emoji: "📊",
    gradient: "linear-gradient(135deg,#2b230d 0%,#161b22 100%)",
    tagline: "Tri-core BTC/USD bot with a weighted consensus vote",
    tech: ["Python", "Streamlit", "CCXT", "pandas", "NumPy", "Plotly"],
    repo: "https://github.com/camouflagechicken/squeezebot",
    why: "A live BTC/USD bot with a 'tri-core' engine — squeeze breakout, wide-chop reversion, and a wave-ride momentum core — that only acts when a weighted multi-signal consensus vote clears.",
    bullets: [
      "Physics-inspired features: velocity, normalized acceleration, candle wick/body geometry, volume force, and a displacement/path 'symmetry' score.",
      "Four-voter consensus (Trend / Physics / Trigger / Liquidity) with per-regime dynamic weights.",
      "Order-book imbalance EMA plus a VWAP 'leash' and chasing-top detection.",
      "Fee-aware net PnL, ATR-scaled trailing stops, a whale shield, and flash-crash / ghost-volume filters.",
      "Streamlit dashboard with realtime candles, trade markers, and a telemetry log."
    ],
    code: [
      { file: "app.py (feature engineering)", lang: "python", code:
`# Physics-inspired features on 1h candles
df['velocity']  = (df['c'] - df['ema20']) / df['atr']      # distance from trend, in ATRs
df['accel']     = df['velocity'].diff()                    # 2nd-order motion
df['vol_force'] = df['v'] / df['v'].rolling(20).mean()     # relative volume

# Wave rider: normalized acceleration + a recent dip = asymmetric bounce
df['accel_norm'] = df['accel'] / (df['accel'].rolling(20).std() + 0.0001)
df['recent_dip'] = df['velocity'].rolling(5).min() < -0.7

# Symmetry: displacement vs path length -> how "clean" is the move?
df['symmetry'] = (abs(df['c'] - df['c'].shift(10))
                  / (abs(df['c'].diff()).rolling(10).sum() + 1e-6)).clip(0, 1)` }
    ]
  },
  {
    slug: "koko", name: "koko", cat: "voice", emoji: "🎙️",
    gradient: "linear-gradient(135deg,#241b38 0%,#161b22 100%)",
    tagline: "Always-on, fully-offline voice companion",
    tech: ["Python", "Whisper", "Kokoro TTS", "ChromaDB", "Unsloth/LM Studio"],
    repo: "https://github.com/camouflagechicken/koko",
    why: "An always-on, fully-offline voice companion: Whisper hears you, a local LLM thinks, Kokoro speaks — interruptible at any time, no wake word required.",
    bullets: [
      "Full-duplex audio: adaptive VAD, barge-in interrupts, and sentence-chunk pipelined TTS for low latency.",
      "Layered ChromaDB vector memory (facts / self / daily / episodes) with near-duplicate dedup and relevance-gated recall.",
      "A nightly 'sleep pass' distills the day into durable long-term memory.",
      "Conversation state machine with per-state prompt guidance and a personality profile.",
      "Auto-authenticates to a local Unsloth Studio LLM (desktop-secret → JWT) — no cloud keys."
    ],
    code: [
      { file: "koko/auth.py", lang: "python", code:
`class UnslothAuth:
    """Mints and caches a Bearer token for a local Unsloth Studio instance."""

    def _login_sync(self) -> str:
        if self.api_key:
            return self.api_key
        secret = _read_secret()          # ~/.unsloth/studio/auth/.desktop_secret
        url = urljoin(self.server_url + "/", "api/auth/desktop-login")
        resp = httpx.post(url, json={"secret": secret})
        return resp.json().get("access_token")

    async def get_token(self, force: bool = False) -> str:
        async with self._lock:
            if not force and self._token:
                return self._token
            self._token = await asyncio.to_thread(self._login_sync)
            return self._token` }
    ]
  },
  {
    slug: "digital-peer-core", name: "digitalPeerCore", cat: "voice", emoji: "🧠",
    gradient: "linear-gradient(135deg,#1b2b38 0%,#161b22 100%)",
    tagline: "Full-duplex, tool-using voice agent",
    tech: ["Python", "faster-whisper", "Orpheus TTS", "ChromaDB", "LM Studio"],
    repo: "https://github.com/camouflagechicken/digital-peer-core",
    why: "A full-duplex, tool-using voice 'peer': the model autonomously selects tools — memory, web search, file reading, sound — to enrich conversation, all on local hardware.",
    bullets: [
      "Function-calling agent loop with 8 tools and a self-modulating cognitive state (equanimity, synthesis_drive, …) re-injected into the prompt each turn.",
      "Interruptible Orpheus TTS playback behind a jitter buffer.",
      "'Synthesis over regurgitation': search and file results are summarized conversationally, never dumped.",
      "ChromaDB + sentence-transformers episodic memory for recall."
    ],
    code: [
      { file: "brain/prompt_templates.py (tool surface)", lang: "python", code:
`# The model chooses tools autonomously from a JSON-schema surface
available_tools = [
  {"name": "fetch_memory",        "description": "Retrieve past facts from vector memory."},
  {"name": "save_memory",         "description": "Store a key fact or preference."},
  {"name": "web_search",          "description": "Live DuckDuckGo search."},
  {"name": "read_workspace_file", "description": "Read a local project file."},
  {"name": "list_workspace_files","description": "List files in the local workspace."},
  {"name": "update_internal_state",
   "description": "Shift own cognitive state: equanimity, synthesis_drive, ..."},
  {"name": "play_sound",          "description": "Play an ambient sound or chime."},
  {"name": "add_directive",       "description": "Record a strict behavioral rule."},
]` }
    ]
  },
  {
    slug: "lighttts-rag", name: "LightTTS-RAG", cat: "voice", emoji: "🗣️",
    gradient: "linear-gradient(135deg,#382b1b 0%,#161b22 100%)",
    tagline: "Local voice assistant with RAG memory",
    tech: ["Python", "Whisper", "Piper TTS", "ChromaDB", "LM Studio"],
    repo: "https://github.com/camouflagechicken/LightTTS-RAG",
    why: "An end-to-end local voice assistant — Whisper STT → LM Studio LLM → Piper TTS — with persistent ChromaDB memory and a persona lock, hosted entirely on your own machine.",
    bullets: [
      "A 'gardener' filter decides what's worth remembering; semantic recall runs before every reply.",
      "Persona / identity lock (bio.json) plus conversation transcript logging.",
      "Lean and privacy-first: no cloud calls anywhere in the loop."
    ],
    code: [
      { file: "memory.py (gardener filter)", lang: "python", code:
`# Episodic memory with a "gardener" that curates what actually sticks
def maybe_remember(moment: Moment) -> None:
    if not is_worth_keeping(moment):        # the gardener filter
        return
    embedding = embed(moment.text)
    if near_duplicate(embedding, threshold=0.92):
        return                              # already know this
    collection.add(
        ids=[moment.id],
        embeddings=[embedding],
        documents=[moment.text],
        metadatas=[{"ts": moment.ts}],
    )` }
    ]
  },
  {
    slug: "modelbench", name: "modelbench", cat: "infra", emoji: "🧪",
    gradient: "linear-gradient(135deg,#2b1b38 0%,#161b22 100%)",
    tagline: "Self-contained LLM evaluation harness",
    tech: ["Python (stdlib)", "SQLite", "JSONL", "HTML/JS dashboard"],
    repo: "https://github.com/camouflagechicken/modelbench",
    why: "A dependency-free harness that scores any OpenAI-compatible model across deterministic, code-exec, SWE, agency, and LLM-as-judge graders — with an autonomous shell agent loop and a web dashboard.",
    bullets: [
      "Sandboxed agent loop that parses fenced commands or JSON tool-calls and runs them in a temp directory.",
      "Cross-process control via heartbeat + stop-file, plus stale-run reconciliation.",
      "SQLite + JSONL persistence and a standalone HTML/JS report generator.",
      "Deterministic grading with scoring traces and an error-tag taxonomy."
    ],
    code: [
      { file: "bench/grading.py (grader taxonomy)", lang: "python", code:
`# A dependency-free grading taxonomy + sandboxed agent loop
GRADERS = {
  "exact":     lambda e, o: 1.0 if o.strip() == e.strip() else 0.0,
  "numeric":   lambda e, o: 1.0 if abs(float(o) - float(e)) < 1e-9 else 0.0,
  "contains":  lambda e, o: 1.0 if e in o else 0.0,
  "code_exec": run_in_subprocess,   # sandboxed, error-tag mapped
  "swe":       write_files_and_test, # temp-dir repo, run the suite
  "agency":    check_sandbox_state,  # did the agent reach the goal state?
  "llm_judge": llm_as_judge,         # fallback when no rule applies
}` }
    ]
  },
  {
    slug: "snap-living-world", name: "Snap", cat: "agents", emoji: "🌐",
    gradient: "linear-gradient(135deg,#0d2b38 0%,#161b22 100%)",
    tagline: "A 'living world' of autonomous AI personas",
    tech: ["FastAPI", "Next.js", "TypeScript", "LM Studio", "ComfyUI"],
    repo: "https://github.com/camouflagechicken/snap-living-world",
    why: "A full-stack social app where autonomous AI personas chat, post generated stories, and move around a map on their own schedules — driven entirely by local LM Studio + ComfyUI.",
    bullets: [
      "Cadence matrices + an autonomous Flight-Plan scheduler per persona, with a 24-hour routine and interpolated GPS movement.",
      "Slot-locking to serialize GPU work, and focus tracking that pauses background generation when a chat opens.",
      "A 'double-texting' follow-up engine plus offline persona fallbacks.",
      "Single-worker priority dispatcher: realtime chat preempts background generation.",
      "ComfyUI (SDXL) workflow injection auto-publishes generated images as persona stories."
    ],
    code: [
      { file: "backend/src/core/config.py", lang: "python", code:
`class Settings(BaseSettings):
    """Application settings loaded from environment variables (SNAP_*)."""

    app_name: str = "Snap Backend"
    app_version: str = "0.2.0"
    debug: bool = True

    cors_origins: list[str] = ["*"]
    host: str = "0.0.0.0"
    port: int = 8000

    # Local AI backends
    lm_studio_url: str = "http://localhost:1234/v1"
    comfyui_base_url: str = "http://localhost:8188"
    comfyui_timeout: int = 60

    model_config = {"env_prefix": "SNAP_", "env_file": ".env"}` }
    ]
  },
  {
    slug: "agent-table", name: "AgentTable", cat: "agents", emoji: "🗯️",
    gradient: "linear-gradient(135deg,#382b1b 0%,#161b22 100%)",
    tagline: "3D multi-agent LLM debate",
    tech: ["Python", "Pygame", "PyOpenGL", "LM Studio"],
    repo: "https://github.com/camouflagechicken/agent-table",
    why: "A 3D multi-agent debate: Architect, Gardener, and Nomad personas — each with a written constitution — queried in parallel against a local model and moderated over structured turns.",
    bullets: [
      "Parallel (threaded) LLM calls to a local Qwen model.",
      "Structured [THOUGHT] / [ANSWER] parsing feeding a 6-turn moderator loop.",
      "Pygame + PyOpenGL scene with ray-picking to select agents."
    ],
    code: [
      { file: "llm_integration.py (debate round)", lang: "python", code:
`# Three personas, queried in parallel, structured [THOUGHT] / [ANSWER]
def debate_round(question, history):
    with ThreadPoolExecutor() as pool:
        futures = [pool.submit(ask, agent, question, history)
                   for agent in (ARCHITECT, GARDENER, NOMAD)]
        replies = [f.result() for f in futures]

    thoughts = [parse(r, "THOUGHT") for r in replies]
    answers  = [parse(r, "ANSWER")  for r in replies]
    return moderator_synthesis(thoughts, answers)` }
    ]
  },
  {
    slug: "apex-phantom", name: "apex-phantom", cat: "web3d", emoji: "🏎️",
    gradient: "linear-gradient(135deg,#380d0d 0%,#161b22 100%)",
    tagline: "F1 telemetry → 3D ghost-racing sim",
    tech: ["JavaScript", "Three.js", "Cannon-es", "Vite", "OpenF1"],
    repo: "https://github.com/camouflagechicken/apex-phantom",
    why: "A 3D browser F1 sim that reconstructs racetracks from real OpenF1 telemetry and lets you race holographic ghosts replaying real drivers' laps.",
    bullets: [
      "Real-data pipeline: session → fastest lap → centerline → smoothing → track ribbon, curbs, and walls.",
      "Coordinate engineering (decimeter telemetry → Three.js space), verified against known circuit lengths.",
      "Ghost playback via Hermite / Catmull-Rom interpolation with a live delta to the nearest ghost.",
      "Rate-limited + exponential-backoff API client, IndexedDB cache, and mock-data fallback.",
      "Cannon-es raycast vehicle physics."
    ],
    code: [
      { file: "src/track/trackBuilder.js", lang: "javascript", code:
`// Rebuild a raceable track from real OpenF1 telemetry samples
export function buildCenterline(points) {
  // Catmull-Rom -> smooth centerline through noisy telemetry
  return catmullRom(points, 20);
}

export function buildTrack(centerline, width) {
  return {
    left:   offsetPolyline(centerline, -width / 2),
    right:  offsetPolyline(centerline,  width / 2),
    curbs:  addCurbs(centerline, width),
    walls:  addWalls(centerline, width),
  };
}` }
    ]
  },
  {
    slug: "assetsmithy", name: "AssetSmithy", cat: "unity", emoji: "🧱",
    gradient: "linear-gradient(135deg,#1b382b 0%,#161b22 100%)",
    tagline: "Unity editor plugin → ComfyUI text-to-3D",
    tech: ["C#", "Unity", "FastAPI", "ComfyUI (TRELLIS)"],
    repo: "https://github.com/camouflagechicken/assetsmithy",
    why: "A Unity editor plugin that drives a local ComfyUI text-to-3D pipeline: prompt + style go to a local bridge, and the returned GLB lands straight in your scene.",
    bullets: [
      "Editor window → async HTTP → ComfyUI TRELLIS text-to-3D.",
      "Style-taxonomy prompt injection (pixel / low-poly / hand-painted / realistic …).",
      "Downloads the GLB and imports it via AssetDatabase.Refresh()."
    ],
    code: [
      { file: "Assets/Editor/AssetSmithyAgent.cs", lang: "csharp", code:
`// Unity editor window -> local ComfyUI text-to-3D pipeline
async void GenerateAsset(string prompt, string style) {
    var payload = JsonUtility.ToJson(new { mode = "3d", prompt, style });
    using var www = UnityWebRequest.Post(
        "http://localhost:8000/generate", payload, "application/json");

    await www.SendWebRequest();

    if (www.result == UnityWebRequest.Result.Success) {
        var bytes = www.downloadHandler.data;
        File.WriteAllBytes(Path.Combine("Assets", "forged_asset.glb"), bytes);
        AssetDatabase.Refresh();      // import into the project
    }
}` }
    ]
  }
];

const CATEGORIES = [
  { id: "all",    label: "all" },
  { id: "trading", label: "trading" },
  { id: "voice",  label: "voice" },
  { id: "agents", label: "agents" },
  { id: "infra",  label: "infra" },
  { id: "web3d",  label: "web / 3d" },
  { id: "unity",  label: "unity" },
];

/* ---------- DOM helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const grid = $("#projects-grid");
const filtersEl = $("#filters");

/* ---------- render filters ---------- */
function renderFilters() {
  CATEGORIES.forEach((c) => {
    const btn = document.createElement("button");
    btn.className = "chip" + (c.id === "all" ? " active" : "");
    btn.dataset.cat = c.id;
    btn.textContent = c.label;
    filtersEl.appendChild(btn);
  });
  filtersEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    filtersEl.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
    chip.classList.add("active");
    renderGrid(chip.dataset.cat);
  });
}

/* ---------- render cards ---------- */
function cardHTML(p) {
  const tags = p.tech.map((t) => `<span class="tag">${t}</span>`).join("");
  return `
    <article class="card" data-slug="${p.slug}" data-cat="${p.cat}">
      <div class="card-media" style="background:${p.gradient}">
        <div class="card-cover">${p.emoji}</div>
        <img class="card-gif" src="assets/${p.slug}.gif" alt="" loading="lazy"
             onerror="this.style.display='none'">
      </div>
      <div class="card-body">
        <p class="card-cat">${p.cat}</p>
        <h3 class="card-title">${p.name}</h3>
        <p class="card-tagline">${p.tagline}</p>
        <div class="card-tags">${tags}</div>
        <div class="card-foot">
          <span class="hint">view deep-dive →</span>
          <span>${p.tech.length} tech</span>
        </div>
      </div>
    </article>`;
}

function renderGrid(filter = "all") {
  const list = PROJECTS.filter((p) => filter === "all" || p.cat === filter);
  grid.innerHTML = list.map(cardHTML).join("");
  observeCards();
}

function observeCards() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("reveal"); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  grid.querySelectorAll(".card").forEach((c) => io.observe(c));
}

/* ---------- modal ---------- */
const modal = $("#modal");
const modalCat = $("#modal-cat");
const modalTitle = $("#modal-title");
const modalPreview = $("#modal-preview");
const modalMeta = $("#modal-meta");
const modalTabs = $("#modal-tabs");
const modalBody = $("#modal-body");

function openModal(slug) {
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) return;

  modalCat.textContent = p.cat;
  modalTitle.textContent = p.name;

  modalPreview.innerHTML = `
    <img src="assets/${p.slug}.gif" alt="${p.name} demo" loading="lazy"
         onerror="this.parentElement.querySelector('span').style.display='inline';this.style.display='none'">
    <span style="display:none">demo gif goes here — drop assets/${p.slug}.gif</span>`;

  modalMeta.innerHTML = `
    <div class="m-row"><span class="m-label">category</span><span>${p.cat}</span></div>
    <div class="m-row"><span class="m-label">stack</span><span>${p.tech.join(" · ")}</span></div>
    <div class="m-row"><span class="m-label">source</span>
      <a href="${p.repo}" target="_blank" rel="noopener">github ↗</a></div>`;

  modalTabs.innerHTML = "";
  modalBody.innerHTML = "";

  const tabs = [{ id: "overview", label: "overview" }]
    .concat(p.code.map((c, i) => ({ id: "code" + i, label: c.file })));

  tabs.forEach((t, i) => {
    const b = document.createElement("button");
    b.className = "modal-tab" + (i === 0 ? " active" : "");
    b.dataset.pane = t.id;
    b.textContent = t.label;
    modalTabs.appendChild(b);
  });

  // overview pane
  const ov = document.createElement("div");
  ov.className = "pane overview active";
  ov.dataset.pane = "overview";
  const bullets = p.bullets.map((b) => `<li>${b}</li>`).join("");
  ov.innerHTML = `
    <p>${p.why}</p>
    <h4>What makes it interesting</h4>
    <ul>${bullets}</ul>`;
  modalBody.appendChild(ov);

  // code panes
  p.code.forEach((c, i) => {
    const pane = document.createElement("div");
    pane.className = "pane";
    pane.dataset.pane = "code" + i;
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.className = "language-" + c.lang;
    code.textContent = c.code;
    pre.appendChild(code);
    pane.appendChild(pre);
    modalBody.appendChild(pane);
    if (window.hljs) hljs.highlightElement(code);
  });

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) openModal(card.dataset.slug);
});
modalTabs.addEventListener("click", (e) => {
  const tab = e.target.closest(".modal-tab");
  if (!tab) return;
  modalTabs.querySelectorAll(".modal-tab").forEach((b) => b.classList.remove("active"));
  tab.classList.add("active");
  modalBody.querySelectorAll(".pane").forEach((p) => p.classList.remove("active"));
  modalBody.querySelector(`[data-pane="${tab.dataset.pane}"]`).classList.add("active");
});
$("#modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

/* ---------- typing effect ---------- */
const PHRASES = [
  "I distill systems into logical flows.",
  "offline LLM infrastructure",
  "real-time voice agents",
  "multi-agent worlds",
  "autonomous trading systems",
  "I treat AI as a collaborator.",
];
const target = $("#type-target");
let pi = 0, ci = 0, deleting = false;

function typeLoop() {
  const phrase = PHRASES[pi];
  target.textContent = phrase.slice(0, ci);
  if (!deleting) {
    ci++;
    if (ci > phrase.length) { deleting = true; setTimeout(typeLoop, 1400); return; }
    setTimeout(typeLoop, 55);
  } else {
    ci--;
    if (ci === 0) { deleting = false; pi = (pi + 1) % PHRASES.length; }
    setTimeout(typeLoop, 28);
  }
}

/* ---------- more projects ---------- */
const MORE_PROJECTS = [
  { name: "codex-arc", desc: "Natural-language code editor that creates/updates files via a local LLM.", tech: ["JS", "Tailwind", "LM Studio"], repo: "https://github.com/camouflagechicken/codex-arc" },
  { name: "multiplayer-wordle", desc: "Live Wordle clone with active users, hosted with GitHub-backed storage.", tech: ["React", "TypeScript"], repo: "https://github.com/camouflagechicken/multiplayer-wordle" },
  { name: "RE3-Web-Portal", desc: "Resident Evil 3 (PS1) running in the browser via EmulatorJS, with save states.", tech: ["JS", "EmulatorJS", "IndexedDB"], repo: "https://github.com/camouflagechicken/RE3-Web-Portal" },
  { name: "deduplication-engine", desc: "Browser tool that hashes a folder and prunes duplicate files client-side.", tech: ["JS", "SHA-256", "JSZip"], repo: "https://github.com/camouflagechicken/deduplication-engine" },
  { name: "EzRead", desc: "React Native e-reader with on-device TTS intent.", tech: ["Expo", "React Native", "Zustand"], repo: "https://github.com/camouflagechicken/EzRead" }
];

function renderMore() {
  $("#more-grid").innerHTML = MORE_PROJECTS.map((m) => `
    <div class="more-card">
      <h3><a href="${m.repo}" target="_blank" rel="noopener">${m.name} ↗</a></h3>
      <p>${m.desc}</p>
      <div class="card-tags">${m.tech.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
    </div>`).join("");
}

/* ---------- animated counters ---------- */
function animateCounters() {
  const nums = document.querySelectorAll(".stat-num[data-count]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / 900);
        el.textContent = Math.round(target * p);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach((n) => io.observe(n));
}

/* ---------- init ---------- */
renderFilters();
renderGrid("all");
renderMore();
animateCounters();
typeLoop();
$("#year").textContent = new Date().getFullYear();

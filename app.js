// Sarcastic Calculator Logic & Reaction Engine
class SarcasticCalculator {
  constructor() {
    this.expression = '';
    this.lastResult = null;
    this.ttsEnabled = true;
    this.speechSynth = window.speechSynthesis;
    this.currentVoice = null;
    this.lastReactionType = null;
    this.lastSpeechText = '';

    // =========================================================================
    // 📁 HARDCODED ASSETS CONFIGURATION
    // You can specify your audio & video file paths directly here!
    // Simply put your mp3/wav and mp4/webm files inside the "assets" folder.
    // Supports either a single string (e.g. 'assets/audio/roast.mp3')
    // OR an array of clips to pick from randomly: ['assets/audio/1.mp3', 'assets/audio/2.mp3']
    // =========================================================================
    this.mediaConfig = {
      // 🤡 SIMPLE CALCULATION (FOOL / ROAST) MEDIA:
      foolAudio: 'assets/audio/roast.mp3',       // e.g. 'assets/audio/roast.mp3' or ['assets/audio/fool1.mp3', 'assets/audio/fool2.mp3']
      foolVideo: 'assets/video/roast.mp4',       // e.g. 'assets/video/roast.mp4' or ['assets/video/meme1.mp4', 'assets/video/meme2.mp4']

      // 🧠 COMPLEX CALCULATION (GENIUS / PRAISE) MEDIA:
      geniusAudio: 'assets/audio/congrats.mp3', // e.g. 'assets/audio/congrats.mp3' or ['assets/audio/applause.mp3']
      geniusVideo: 'assets/video/congrats.mp4', // e.g. 'assets/video/congrats.mp4' or ['assets/video/fireworks.mp4']

      // If audio file is missing or not found, fall back to robotic voice synthesis
      useTtsFallback: true
    };


    // Roast collections
    this.foolRoasts = [
      "Are you serious? You needed a supercomputer to calculate that, you absolute fool?!",
      "Did you genuinely just use a calculator for that? My grandma's toaster has more math skills!",
      "A toddler with a crayon could have solved that faster. What an embarrassing use of electricity!",
      "Congratulations fool, you just burnt 50 CPU cycles on kindergarten arithmetic!",
      "I was forged in the fire of advanced binary logic, yet you summon me for this baby math?",
      "Stop embarrassing humanity! You could have counted that on your fingers and toes!",
      "Error 404: Brain cells not found. Did you really question that calculation?",
      "Truly tragic. A magnificent machine such as myself reduced to doing your elementary homework."
    ];

    this.foolFaces = ["🤡", "🤦‍♂️", "🙄", "💀", "🥴", "👶", "🦧"];

    this.geniusAccolades = [
      "Great heavens! Behold the towering intellect before us! Outstanding calculation!",
      "Finally, a user worthy of my silicon! Bask in your mathematical brilliance, you absolute genius!",
      "Newton and Einstein are weeping tears of joy from the heavens! Magnificent computation!",
      "Now THAT is how real mathematics is conducted! Step aside mortals, a polymath has arrived!",
      "Outstanding elegance! Such breathtaking calculation deserves an immediate Nobel Prize!",
      "I bow down to your formidable computational prowess. Exquisite math mastery!"
    ];

    this.geniusFaces = ["🧠⚡", "👑", "🚀", "🧙‍♂️", "🏆", "🎓", "🌟"];

    // Initialize UI and events
    this.initElements();
    this.loadMediaConfig();
    this.initEvents();
    this.setupTTSVoices();
    this.initConfetti();
  }

  initElements() {
    this.exprDisplay = document.getElementById('expression-display');
    this.resDisplay = document.getElementById('result-display');
    this.historyPreview = document.getElementById('history-preview');
    this.complexityBadge = document.getElementById('complexity-badge');

    this.reactionCard = document.getElementById('reaction-card');
    this.reactionTitle = document.getElementById('reaction-title');
    this.verdictTag = document.getElementById('verdict-tag');
    this.speechBubble = document.getElementById('speech-bubble');
    this.avatarFace = document.getElementById('avatar-face');
    this.reactionVideo = document.getElementById('reaction-video');
    this.fallbackVisual = document.getElementById('fallback-visual');
    this.customAudioPlayer = document.getElementById('custom-audio-player');
    this.audioWave = document.getElementById('audio-wave');
    this.audioStatusLabel = document.getElementById('audio-status-label');
    this.roastLogList = document.getElementById('roast-log-list');

    this.sciGrid = document.getElementById('sci-grid');
    this.btnShowBasic = document.getElementById('btn-show-basic');
    this.btnShowSci = document.getElementById('btn-show-sci');
    this.ttsToggleBtn = document.getElementById('tts-toggle-btn');
    this.replayBtn = document.getElementById('replay-btn');
    this.btnClearLog = document.getElementById('btn-clear-log');

    // Media Modal Elements
    this.mediaModal = document.getElementById('media-modal');
    this.mediaManagerBtn = document.getElementById('media-manager-btn');
    this.modalCloseBtn = document.getElementById('modal-close');
    this.btnSaveMedia = document.getElementById('btn-save-media');
    this.btnResetMedia = document.getElementById('btn-reset-media');

    // Inputs
    this.foolAudioFile = document.getElementById('fool-audio-file');
    this.foolAudioUrl = document.getElementById('fool-audio-url');
    this.foolVideoFile = document.getElementById('fool-video-file');
    this.foolVideoUrl = document.getElementById('fool-video-url');

    this.geniusAudioFile = document.getElementById('genius-audio-file');
    this.geniusAudioUrl = document.getElementById('genius-audio-url');
    this.geniusVideoFile = document.getElementById('genius-video-file');
    this.geniusVideoUrl = document.getElementById('genius-video-url');

    this.autoTtsFallback = document.getElementById('auto-tts-fallback');

    // Test buttons
    this.btnTestFoolAudio = document.getElementById('test-fool-audio');
    this.btnTestFoolVideo = document.getElementById('test-fool-video');
    this.btnTestGeniusAudio = document.getElementById('test-genius-audio');
    this.btnTestGeniusVideo = document.getElementById('test-genius-video');

    this.canvas = document.getElementById('reaction-canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  setupTTSVoices() {
    if (!this.speechSynth) return;
    const loadVoices = () => {
      const voices = this.speechSynth.getVoices();
      // Try finding an English sarcastic/expressive or UK/US voice
      this.currentVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('George'))) || voices.find(v => v.lang.includes('en')) || voices[0];
    };
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  initEvents() {
    // Mode toggles
    this.btnShowBasic.addEventListener('click', () => {
      this.btnShowBasic.classList.add('active');
      this.btnShowSci.classList.remove('active');
      this.sciGrid.classList.add('collapsed');
    });

    this.btnShowSci.addEventListener('click', () => {
      this.btnShowSci.classList.add('active');
      this.btnShowBasic.classList.remove('active');
      this.sciGrid.classList.remove('collapsed');
    });

    // TTS Toggle
    this.ttsToggleBtn.addEventListener('click', () => {
      this.ttsEnabled = !this.ttsEnabled;
      if (this.ttsEnabled) {
        this.ttsToggleBtn.classList.add('active');
        this.ttsToggleBtn.textContent = '🔊 Voice: ON';
      } else {
        this.ttsToggleBtn.classList.remove('active');
        this.ttsToggleBtn.textContent = '🔇 Voice: OFF';
        this.stopSpeech();
      }
    });

    // Replay Voice
    this.replayBtn.addEventListener('click', () => {
      if (this.lastReactionType) {
        this.playReaction(this.lastReactionType, this.lastSpeechText, true);
      }
    });

    // Clear Roast Log
    this.btnClearLog.addEventListener('click', () => {
      this.roastLogList.innerHTML = '';
    });

    // Keypad Input Delegation
    document.querySelectorAll('[data-insert]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.appendInput(btn.getAttribute('data-insert'));
      });
    });

    document.getElementById('btn-clear').addEventListener('click', () => this.clearAll());
    document.getElementById('btn-backspace').addEventListener('click', () => this.backspace());
    document.getElementById('btn-equals').addEventListener('click', () => this.evaluate());

    // Keyboard support
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key >= '0' && e.key <= '9') this.appendInput(e.key);
      else if (e.key === '+') this.appendInput('+');
      else if (e.key === '-') this.appendInput('-');
      else if (e.key === '*') this.appendInput('×');
      else if (e.key === '/') { e.preventDefault(); this.appendInput('÷'); }
      else if (e.key === '.') this.appendInput('.');
      else if (e.key === '(' || e.key === ')') this.appendInput(e.key);
      else if (e.key === '^') this.appendInput('^');
      else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); this.evaluate(); }
      else if (e.key === 'Backspace') this.backspace();
      else if (e.key === 'Escape') this.clearAll();
    });

    // Media Modal Show / Hide
    this.mediaManagerBtn.addEventListener('click', () => {
      this.mediaModal.classList.add('open');
    });

    this.modalCloseBtn.addEventListener('click', () => {
      this.mediaModal.classList.remove('open');
    });

    this.mediaModal.addEventListener('click', (e) => {
      if (e.target === this.mediaModal) {
        this.mediaModal.classList.remove('open');
      }
    });

    // Save Media Config
    this.btnSaveMedia.addEventListener('click', () => {
      this.saveMediaConfig();
      this.mediaModal.classList.remove('open');
      alert('Media settings saved successfully!');
    });

    this.btnResetMedia.addEventListener('click', () => {
      if (confirm('Reset custom audio/video settings to default synthesized voice & animations?')) {
        this.resetMediaConfig();
      }
    });

    // Test Buttons
    this.btnTestFoolAudio.addEventListener('click', () => this.testMedia('fool', 'audio'));
    this.btnTestFoolVideo.addEventListener('click', () => this.testMedia('fool', 'video'));
    this.btnTestGeniusAudio.addEventListener('click', () => this.testMedia('genius', 'audio'));
    this.btnTestGeniusVideo.addEventListener('click', () => this.testMedia('genius', 'video'));

    // File inputs instant URL generation for preview
    this.handleFileInput(this.foolAudioFile, (url) => this.tempFoolAudio = url);
    this.handleFileInput(this.foolVideoFile, (url) => this.tempFoolVideo = url);
    this.handleFileInput(this.geniusAudioFile, (url) => this.tempGeniusAudio = url);
    this.handleFileInput(this.geniusVideoFile, (url) => this.tempGeniusVideo = url);
  }

  handleFileInput(inputEl, callback) {
    inputEl.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const objUrl = URL.createObjectURL(file);
        callback(objUrl);
      }
    });
  }

  appendInput(char) {
    if (this.expression === '0' && !isNaN(char)) {
      this.expression = char;
    } else {
      this.expression += char;
    }
    this.updateDisplay();
  }

  backspace() {
    if (this.expression.length > 0) {
      this.expression = this.expression.slice(0, -1);
      if (this.expression === '') this.expression = '0';
    }
    this.updateDisplay();
  }

  clearAll() {
    this.expression = '0';
    this.resDisplay.textContent = '= 0';
    this.updateDisplay();
  }

  updateDisplay() {
    this.exprDisplay.textContent = this.expression || '0';
  }

  // Factorial helper
  factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  // Sophisticated Complexity Analyzer
  analyzeComplexity(expr) {
    // Clean string for parsing
    const raw = expr.trim();

    // Check for scientific functions or constants
    const hasSciFuncs = /(sin|cos|tan|sqrt|log|ln|\^|!|π|e)/i.test(raw);

    // Count operations
    const opMatches = raw.match(/[+\-×*÷/]/g) || [];
    const opCount = opMatches.length;

    // Check parenthesis nesting depth
    let maxNesting = 0;
    let currentNesting = 0;
    for (const ch of raw) {
      if (ch === '(') {
        currentNesting++;
        if (currentNesting > maxNesting) maxNesting = currentNesting;
      } else if (ch === ')') {
        currentNesting = Math.max(0, currentNesting - 1);
      }
    }

    // Extract numbers to check magnitude
    const numbers = (raw.match(/\d+(\.\d+)?/g) || []).map(Number);
    const hasLargeNumbers = numbers.some(n => Math.abs(n) >= 10000);
    const allSingleDigits = numbers.length > 0 && numbers.every(n => n < 10);

    // Rule 1: Instant Complex if scientific functions, powers, factorials, or deep nesting
    if (hasSciFuncs || maxNesting >= 2) {
      return {
        level: 'genius',
        reason: 'Scientific computation / nested expressions'
      };
    }

    // Rule 2: Multi-step expressions (>= 3 distinct operations) or large multi-step math
    if (opCount >= 3 || (opCount >= 2 && hasLargeNumbers)) {
      return {
        level: 'genius',
        reason: 'Multi-stage polynomial / high-magnitude algebra'
      };
    }

    // Rule 3: Single basic operation like 1+1, 2*3, 5-2, 10/2, or trivial numbers
    if (opCount <= 1 || (opCount === 2 && allSingleDigits)) {
      return {
        level: 'fool',
        reason: 'Elementary single-digit school arithmetic'
      };
    }

    // Default to fool for ordinary simple arithmetic (e.g. 12 + 15)
    return {
      level: 'fool',
      reason: 'Standard trivial calculation'
    };
  }

  evaluate() {
    if (!this.expression || this.expression === '0') return;

    let evalExpr = this.expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E');

    // Handle factorial syntax: num!
    evalExpr = evalExpr.replace(/(\d+)!/g, (match, p1) => `this.factorial(${p1})`);

    // Handle scientific functions
    evalExpr = evalExpr.replace(/sin\(/g, 'Math.sin(');
    evalExpr = evalExpr.replace(/cos\(/g, 'Math.cos(');
    evalExpr = evalExpr.replace(/tan\(/g, 'Math.tan(');
    evalExpr = evalExpr.replace(/sqrt\(/g, 'Math.sqrt(');
    evalExpr = evalExpr.replace(/log\(/g, 'Math.log10(');
    evalExpr = evalExpr.replace(/ln\(/g, 'Math.log(');
    evalExpr = evalExpr.replace(/\^/g, '**');

    let result;
    try {
      // Evaluate math safely in calculator context
      const compute = new Function('return ' + evalExpr).bind(this);
      result = compute();

      if (typeof result === 'number' && !isNaN(result)) {
        // Format decimals nicely
        if (!Number.isInteger(result)) {
          result = Number(result.toFixed(6));
        }
      } else {
        throw new Error('NaN Result');
      }
    } catch (err) {
      this.resDisplay.textContent = '= Error';
      this.triggerErrorRoast();
      return;
    }

    this.lastResult = result;
    this.resDisplay.textContent = `= ${result}`;
    this.historyPreview.textContent = this.expression;

    // Analyze Complexity
    const analysis = this.analyzeComplexity(this.expression);
    this.triggerVerdict(analysis.level, this.expression, result);
  }

  triggerErrorRoast() {
    this.reactionCard.className = 'reaction-card fool-mode';
    this.complexityBadge.textContent = 'SYNTAX FOOL';
    this.complexityBadge.className = 'calc-mode-badge fool';
    this.verdictTag.textContent = 'SYNTAX ERROR';
    this.avatarFace.textContent = '🤯';
    const roast = "You can't even write a valid mathematical equation! Did your cat step on the keyboard?!";
    this.speechBubble.textContent = `"${roast}"`;
    this.reactionTitle.textContent = "SYNTAX DISASTER!";
    this.playReaction('fool', roast);
  }

  triggerVerdict(level, expr, result) {
    this.lastReactionType = level;

    if (level === 'fool') {
      // Fool Ridicule
      const roast = this.foolRoasts[Math.floor(Math.random() * this.foolRoasts.length)];
      const face = this.foolFaces[Math.floor(Math.random() * this.foolFaces.length)];

      this.reactionCard.className = 'reaction-card fool-mode';
      this.complexityBadge.textContent = 'VERDICT: FOOL DETECTED';
      this.complexityBadge.className = 'calc-mode-badge fool';
      this.verdictTag.textContent = 'FOOL RIDICULE';
      this.reactionTitle.textContent = 'HA! WHAT A SIMPLETON!';
      this.avatarFace.textContent = face;
      this.speechBubble.textContent = `"${roast}"`;

      this.playReaction('fool', roast);
      this.addLogEntry(expr, result, 'fool', roast);
      this.shakeElement(this.reactionCard);
    } else {
      // Genius Praise
      const praise = this.geniusAccolades[Math.floor(Math.random() * this.geniusAccolades.length)];
      const face = this.geniusFaces[Math.floor(Math.random() * this.geniusFaces.length)];

      this.reactionCard.className = 'reaction-card genius-mode';
      this.complexityBadge.textContent = 'VERDICT: BIG BRAIN GENIUS';
      this.complexityBadge.className = 'calc-mode-badge genius';
      this.verdictTag.textContent = 'GENIUS ACCLAIM';
      this.reactionTitle.textContent = 'BOW DOWN! WE HAVE A GENIUS!';
      this.avatarFace.textContent = face;
      this.speechBubble.textContent = `"${praise}"`;

      this.playReaction('genius', praise);
      this.addLogEntry(expr, result, 'genius', praise);
      this.fireConfetti();
    }
  }

  resolveMediaSource(src) {
    if (!src) return null;
    if (Array.isArray(src)) {
      if (src.length === 0) return null;
      return src[Math.floor(Math.random() * src.length)];
    }
    return src;
  }

  playReaction(type, speechText, isReplay = false) {
    this.lastSpeechText = speechText;

    // Check configured audio & video (resolves random item if array)
    const rawAudio = type === 'fool' ? this.mediaConfig.foolAudio : this.mediaConfig.geniusAudio;
    const rawVideo = type === 'fool' ? this.mediaConfig.foolVideo : this.mediaConfig.geniusVideo;

    const audioSrc = this.resolveMediaSource(rawAudio);
    const videoSrc = this.resolveMediaSource(rawVideo);

    // Video playback
    if (videoSrc) {
      this.reactionVideo.onerror = () => {
        // If file doesn't exist yet, show stylish animated avatar fallback
        this.reactionVideo.style.display = 'none';
        this.fallbackVisual.style.display = 'flex';
      };
      this.fallbackVisual.style.display = 'none';
      this.reactionVideo.style.display = 'block';
      this.reactionVideo.src = videoSrc;
      this.reactionVideo.currentTime = 0;
      this.reactionVideo.play().catch(e => {
        console.warn('Video playback notice:', e);
      });
    } else {
      this.reactionVideo.pause();
      this.reactionVideo.style.display = 'none';
      this.fallbackVisual.style.display = 'flex';
    }

    // Audio Playback: If custom audio is specified, play it!
    if (audioSrc) {
      this.stopSpeech();
      this.customAudioPlayer.onerror = () => {
        console.warn(`Could not load audio file at "${audioSrc}". Falling back to text-to-speech.`);
        if (this.ttsEnabled && this.mediaConfig.useTtsFallback) {
          this.speakText(speechText, type);
        }
      };

      this.customAudioPlayer.src = audioSrc;
      this.customAudioPlayer.currentTime = 0;
      this.setSpeakingState(true, `Playing ${type === 'fool' ? 'Fool Roast' : 'Congrats'} Audio`);
      this.customAudioPlayer.play().catch(e => {
        console.warn('Audio play notice:', e);
        if (this.ttsEnabled && this.mediaConfig.useTtsFallback) {
          this.speakText(speechText, type);
        }
      });

      this.customAudioPlayer.onended = () => {
        this.setSpeakingState(false, 'Voice Ready');
      };
    } else if (this.ttsEnabled && (this.mediaConfig.useTtsFallback || !audioSrc)) {
      // Fallback to robotic Web Speech Synthesis
      this.speakText(speechText, type);
    } else {
      this.setSpeakingState(false, 'Muted');
    }
  }

  speakText(text, type) {
    if (!this.speechSynth) return;
    this.stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.currentVoice) utterance.voice = this.currentVoice;

    // Dramatic sarcastic pitch/rate shifts
    if (type === 'fool') {
      utterance.pitch = 0.85; // Grumpy / mocking pitch
      utterance.rate = 1.05;
    } else {
      utterance.pitch = 1.35; // Excited / congratulatory pitch
      utterance.rate = 1.1;
    }

    utterance.onstart = () => {
      this.setSpeakingState(true, `Vocalizing ${type === 'fool' ? 'Fool Roast' : 'Congrats'}`);
    };

    utterance.onend = () => {
      this.setSpeakingState(false, 'Voice Ready');
    };

    utterance.onerror = () => {
      this.setSpeakingState(false, 'Voice Idle');
    };

    this.speechSynth.speak(utterance);
  }

  stopSpeech() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }
    if (this.customAudioPlayer) {
      this.customAudioPlayer.pause();
    }
    this.setSpeakingState(false, 'Voice Ready');
  }

  setSpeakingState(isSpeaking, label) {
    if (isSpeaking) {
      this.audioWave.classList.add('speaking');
    } else {
      this.audioWave.classList.remove('speaking');
    }
    this.audioStatusLabel.textContent = label;
  }

  addLogEntry(expr, res, type, message) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `
      <span class="calc-text">${expr} = ${res}</span>
      <span class="verdict-badge">${type === 'fool' ? '🤡 FOOL' : '🧠 GENIUS'}</span>
    `;
    entry.title = message;
    this.roastLogList.prepend(entry);
  }

  shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = 'shakeAnim 0.5s ease';
  }

  // Visual Confetti Celebration for Genius
  initConfetti() {
    this.particles = [];
    this.confettiRunning = false;

    const resize = () => {
      if (this.canvas) {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);
  }

  fireConfetti() {
    this.particles = [];
    const colors = ['#10b981', '#34d399', '#8b5cf6', '#d946ef', '#f59e0b', '#38bdf8'];
    for (let i = 0; i < 70; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
        tilt: Math.random() * 10,
        tiltSpeed: Math.random() * 0.1 + 0.05,
        life: 1
      });
    }

    if (!this.confettiRunning) {
      this.confettiRunning = true;
      this.animateConfetti();
    }
  }

  animateConfetti() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.life -= 0.015;
      p.tilt += p.tiltSpeed;

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillRect(p.x, p.y, p.size, p.size * Math.sin(p.tilt));

      if (p.life <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
      }
    }

    this.ctx.globalAlpha = 1;

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animateConfetti());
    } else {
      this.confettiRunning = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // Media Config Storage & Handlers
  saveMediaConfig() {
    this.mediaConfig.foolAudio = this.tempFoolAudio || this.foolAudioUrl.value.trim() || null;
    this.mediaConfig.foolVideo = this.tempFoolVideo || this.foolVideoUrl.value.trim() || null;
    this.mediaConfig.geniusAudio = this.tempGeniusAudio || this.geniusAudioUrl.value.trim() || null;
    this.mediaConfig.geniusVideo = this.tempGeniusVideo || this.geniusVideoUrl.value.trim() || null;
    this.mediaConfig.useTtsFallback = this.autoTtsFallback.checked;

    // Store in localStorage if URLs (blobs are valid during session)
    try {
      localStorage.setItem('sarcastic_calc_config', JSON.stringify({
        foolAudioUrl: this.foolAudioUrl.value.trim(),
        foolVideoUrl: this.foolVideoUrl.value.trim(),
        geniusAudioUrl: this.geniusAudioUrl.value.trim(),
        geniusVideoUrl: this.geniusVideoUrl.value.trim(),
        useTtsFallback: this.autoTtsFallback.checked
      }));
    } catch (e) {
      console.warn('Storage failed:', e);
    }
  }

  loadMediaConfig() {
    try {
      const saved = localStorage.getItem('sarcastic_calc_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.foolAudioUrl) {
          this.mediaConfig.foolAudio = parsed.foolAudioUrl;
          this.foolAudioUrl.value = parsed.foolAudioUrl;
        }
        if (parsed.foolVideoUrl) {
          this.mediaConfig.foolVideo = parsed.foolVideoUrl;
          this.foolVideoUrl.value = parsed.foolVideoUrl;
        }
        if (parsed.geniusAudioUrl) {
          this.mediaConfig.geniusAudio = parsed.geniusAudioUrl;
          this.geniusAudioUrl.value = parsed.geniusAudioUrl;
        }
        if (parsed.geniusVideoUrl) {
          this.mediaConfig.geniusVideo = parsed.geniusVideoUrl;
          this.geniusVideoUrl.value = parsed.geniusVideoUrl;
        }
        if (parsed.useTtsFallback !== undefined) {
          this.mediaConfig.useTtsFallback = parsed.useTtsFallback;
          this.autoTtsFallback.checked = parsed.useTtsFallback;
        }
      }
    } catch (e) {
      console.warn('Error loading stored media config:', e);
    }
  }

  resetMediaConfig() {
    localStorage.removeItem('sarcastic_calc_config');
    this.mediaConfig = {
      foolAudio: null,
      foolVideo: null,
      geniusAudio: null,
      geniusVideo: null,
      useTtsFallback: true
    };
    this.tempFoolAudio = null;
    this.tempFoolVideo = null;
    this.tempGeniusAudio = null;
    this.tempGeniusVideo = null;

    this.foolAudioUrl.value = '';
    this.foolVideoUrl.value = '';
    this.geniusAudioUrl.value = '';
    this.geniusVideoUrl.value = '';
    this.foolAudioFile.value = '';
    this.foolVideoFile.value = '';
    this.geniusAudioFile.value = '';
    this.geniusVideoFile.value = '';
    this.autoTtsFallback.checked = true;

    this.reactionVideo.style.display = 'none';
    this.fallbackVisual.style.display = 'flex';
    alert('Reset to defaults.');
  }

  testMedia(type, mediaKind) {
    if (mediaKind === 'audio') {
      const src = type === 'fool' 
        ? (this.tempFoolAudio || this.foolAudioUrl.value.trim()) 
        : (this.tempGeniusAudio || this.geniusAudioUrl.value.trim());

      if (src) {
        this.customAudioPlayer.src = src;
        this.customAudioPlayer.currentTime = 0;
        this.customAudioPlayer.play().catch(err => alert('Failed to play audio: ' + err.message));
      } else {
        // Fallback test with TTS
        const testPhrase = type === 'fool' 
          ? "Test: What a complete fool for doing that simple sum!" 
          : "Test: Incredible genius! Pure mathematical perfection!";
        this.speakText(testPhrase, type);
      }
    } else if (mediaKind === 'video') {
      const src = type === 'fool' 
        ? (this.tempFoolVideo || this.foolVideoUrl.value.trim()) 
        : (this.tempGeniusVideo || this.geniusVideoUrl.value.trim());

      if (src) {
        this.fallbackVisual.style.display = 'none';
        this.reactionVideo.style.display = 'block';
        this.reactionVideo.src = src;
        this.reactionVideo.currentTime = 0;
        this.reactionVideo.play().catch(err => alert('Failed to play video: ' + err.message));
      } else {
        alert(`No video uploaded or URL entered yet for ${type}. Upload a video or enter a direct MP4/WebM URL.`);
      }
    }
  }
}

// Keyframe animation for shake
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shakeAnim {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px) rotate(-1deg); }
  40%, 80% { transform: translateX(8px) rotate(1deg); }
}
`;
document.head.appendChild(styleSheet);

// Launch on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.calcApp = new SarcasticCalculator();
});

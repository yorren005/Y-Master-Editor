/**
 * Y Master Editor — Procedural Animated SVG Avatar & Fun Nickname Engine
 * Generates deterministic, vibrant, animated SVG avatars and creative handles from seeds.
 */

(function(global) {
  // Fun Nickname Vocabulary
  const ADJECTIVES = [
    'Neon', 'Cyber', 'Quantum', 'Cosmic', 'Velvet', 'Hyper', 'Pixel', 'Aero',
    'Glitch', 'Retro', 'Nova', 'Vivid', 'Turbo', 'Mystic', 'Solar', 'Apex',
    'Prism', 'Echo', 'Shadow', 'Zephyr', 'Astro', 'Flux', 'Zenith', 'Orbital',
    'Stellar', 'Atomic', 'Chrono', 'Kinetic', 'Lumina', 'Vortex'
  ];

  const NOUNS = [
    'Scribe', 'Vector', 'Pixel', 'Glyph', 'Draft', 'Craft', 'Cursor', 'Quill',
    'Canvas', 'Type', 'Monarch', 'Matrix', 'Pulse', 'Warp', 'Forge', 'Voxel',
    'Layer', 'Stylus', 'Artisan', 'Architect', 'Cipher', 'Beacon', 'Atlas',
    'Pilot', 'Voyager', 'Spark', 'Ranger', 'Maestro', 'Specter', 'Titan'
  ];

  // Curated vibrant color palettes: [gradientStart, gradientEnd, accent, eyeColor, bg]
  const PALETTES = [
    { start: '#FF5E62', end: '#FF9966', accent: '#FFD166', eye: '#00F0FF', bg: '#1A1824' }, // Sunset Cyber
    { start: '#00F0FF', end: '#7000FF', accent: '#00E5FF', eye: '#FFE600', bg: '#0F1123' }, // Electric Violet
    { start: '#05FFA1', end: '#00E5FF', accent: '#B4FF39', eye: '#FF007A', bg: '#0D1E1C' }, // Cyber Mint
    { start: '#FF007A', end: '#7928CA', accent: '#FF70A6', eye: '#00F0FF', bg: '#1E1022' }, // Neon Synthwave
    { start: '#FFB800', end: '#FF4D00', accent: '#FFD700', eye: '#00E5FF', bg: '#22160F' }, // Solar Flare
    { start: '#7928CA', end: '#FF0080', accent: '#E0AAFF', eye: '#50E3C2', bg: '#190E26' }, // Deep Nebula
    { start: '#4E65FF', end: '#92EFFD', accent: '#50E3C2', eye: '#FFD166', bg: '#0E172E' }, // Oceanic Vector
    { start: '#10B981', end: '#047857', accent: '#34D399', eye: '#FBBF24', bg: '#062319' }  // Emerald Matrix
  ];

  // Fast string hash generator for deterministic seeding
  function hashString(str) {
    let hash = 5381;
    const clean = String(str || 'YMasterUser');
    for (let i = 0; i < clean.length; i++) {
      hash = ((hash << 5) + hash) + clean.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // Linear congruential pseudo-random generator
  function createSeededRandom(seedInt) {
    let s = seedInt % 2147483647;
    if (s <= 0) s += 2147483646;
    return function() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  const AvatarEngine = {
    /**
     * Generate a creative, fun nickname.
     * @param {boolean} addNumber - Whether to append a 2-digit number for uniqueness
     * @returns {string} E.g., "NeonVector42"
     */
    generateFunNickname(addNumber = true) {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      const num = addNumber ? Math.floor(Math.random() * 89 + 10) : '';
      return `${adj}${noun}${num}`;
    },

    /**
     * Clean and validate a nickname.
     * @param {string} nickname 
     * @returns {{ valid: boolean, sanitized: string, error?: string }}
     */
    validateNickname(nickname) {
      if (!nickname || typeof nickname !== 'string') {
        return { valid: false, sanitized: '', error: 'Nickname cannot be empty.' };
      }
      const sanitized = nickname.trim().replace(/[^a-zA-Z0-9_]/g, '');
      if (sanitized.length < 3) {
        return { valid: false, sanitized, error: 'Nickname must be at least 3 characters.' };
      }
      if (sanitized.length > 24) {
        return { valid: false, sanitized: sanitized.slice(0, 24), error: 'Nickname cannot exceed 24 characters.' };
      }
      return { valid: true, sanitized };
    },

    /**
     * Generates a fully-contained animated SVG markup for a given nickname.
     * @param {string} nickname 
     * @param {object} options { size: number, animated: boolean, idPrefix: string }
     * @returns {string} Raw SVG string
     */
    generateSvg(nickname = 'YMaster', options = {}) {
      const size = options.size || 80;
      const animated = options.animated !== false;
      const seed = hashString(nickname);
      const rand = createSeededRandom(seed);

      const paletteIndex = Math.floor(rand() * PALETTES.length);
      const palette = PALETTES[paletteIndex];
      const prefix = options.idPrefix || `yav_${seed % 10000}_`;

      // Character features derived from seed
      const headShapeType = Math.floor(rand() * 4); // 0: soft rounded, 1: bot cube, 2: shield, 3: circular
      const eyeStyleType = Math.floor(rand() * 3);  // 0: glowing circles, 1: cyber visors, 2: diamond lenses
      const accessoryType = Math.floor(rand() * 4); // 0: antenna, 1: studio headphones, 2: crown horns, 3: halo ring
      const mouthType = Math.floor(rand() * 3);     // 0: waveform smile, 1: cyber beam, 2: minimalist dot

      // Unique rotation speeds for animations
      const rotateSpeed = (8 + (rand() * 8)).toFixed(1);
      const breatheSpeed = (2.5 + (rand() * 1.5)).toFixed(1);
      const blinkDelay = (3 + (rand() * 2)).toFixed(1);

      // Head geometry
      let headShapeSvg = '';
      if (headShapeType === 0) {
        headShapeSvg = `<rect x="25" y="25" width="50" height="50" rx="16" fill="${palette.bg}" stroke="${palette.start}" stroke-width="2.5" />`;
      } else if (headShapeType === 1) {
        headShapeSvg = `<rect x="23" y="27" width="54" height="46" rx="8" fill="${palette.bg}" stroke="${palette.accent}" stroke-width="2.5" />`;
      } else if (headShapeType === 2) {
        headShapeSvg = `<path d="M 26 26 L 74 26 L 68 70 C 50 78, 50 78, 32 70 Z" fill="${palette.bg}" stroke="${palette.start}" stroke-width="2.5" stroke-linejoin="round" />`;
      } else {
        headShapeSvg = `<circle cx="50" cy="50" r="26" fill="${palette.bg}" stroke="${palette.end}" stroke-width="2.5" />`;
      }

      // Eye geometry
      let eyesSvg = '';
      if (eyeStyleType === 0) {
        eyesSvg = `
          <g class="avatar-eyes">
            <circle cx="39" cy="48" r="5" fill="${palette.eye}">
              ${animated ? `<animate attributeName="r" values="5;0.6;5" dur="${blinkDelay}s" repeatCount="indefinite" />` : ''}
            </circle>
            <circle cx="61" cy="48" r="5" fill="${palette.eye}">
              ${animated ? `<animate attributeName="r" values="5;0.6;5" dur="${blinkDelay}s" repeatCount="indefinite" />` : ''}
            </circle>
            <circle cx="41" cy="46" r="1.5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="63" cy="46" r="1.5" fill="#FFFFFF" opacity="0.9" />
          </g>
        `;
      } else if (eyeStyleType === 1) {
        eyesSvg = `
          <g class="avatar-visor">
            <rect x="33" y="44" width="34" height="9" rx="4.5" fill="${palette.eye}" opacity="0.9" />
            <line x1="36" y1="48.5" x2="64" y2="48.5" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round">
              ${animated ? `<animate attributeName="x1" values="36;45;36" dur="2s" repeatCount="indefinite" />` : ''}
            </line>
          </g>
        `;
      } else {
        eyesSvg = `
          <g class="avatar-diamonds">
            <polygon points="39,43 44,48 39,53 34,48" fill="${palette.eye}">
              ${animated ? `<animate attributeName="transform" type="scale" values="1;0.2;1" dur="${blinkDelay}s" repeatCount="indefinite" transform-origin="39 48" />` : ''}
            </polygon>
            <polygon points="61,43 66,48 61,53 56,48" fill="${palette.eye}">
              ${animated ? `<animate attributeName="transform" type="scale" values="1;0.2;1" dur="${blinkDelay}s" repeatCount="indefinite" transform-origin="61 48" />` : ''}
            </polygon>
          </g>
        `;
      }

      // Accessory geometry
      let accessorySvg = '';
      if (accessoryType === 0) {
        // Central vector antenna
        accessorySvg = `
          <g class="avatar-antenna">
            <line x1="50" y1="25" x2="50" y2="12" stroke="${palette.start}" stroke-width="2.5" stroke-linecap="round" />
            <circle cx="50" cy="11" r="4.5" fill="${palette.accent}">
              ${animated ? `<animate attributeName="r" values="4.5;6;4.5" dur="1.5s" repeatCount="indefinite" />` : ''}
            </circle>
          </g>
        `;
      } else if (accessoryType === 1) {
        // Studio headphones
        accessorySvg = `
          <g class="avatar-headphones">
            <path d="M 21 48 A 29 29 0 0 1 79 48" fill="none" stroke="${palette.accent}" stroke-width="3.5" stroke-linecap="round" />
            <rect x="18" y="42" width="6" height="16" rx="3" fill="${palette.start}" />
            <rect x="76" y="42" width="6" height="16" rx="3" fill="${palette.start}" />
          </g>
        `;
      } else if (accessoryType === 2) {
        // Dual horns / vector handles
        accessorySvg = `
          <g class="avatar-horns">
            <polygon points="28,26 34,16 38,26" fill="${palette.accent}" />
            <polygon points="72,26 66,16 62,26" fill="${palette.accent}" />
          </g>
        `;
      } else {
        // Halo Ring
        accessorySvg = `
          <ellipse cx="50" cy="18" rx="20" ry="5" fill="none" stroke="${palette.accent}" stroke-width="2.5" opacity="0.85">
            ${animated ? `<animate attributeName="ry" values="5;7;5" dur="2s" repeatCount="indefinite" />` : ''}
          </ellipse>
        `;
      }

      // Mouth geometry
      let mouthSvg = '';
      if (mouthType === 0) {
        mouthSvg = `<path d="M 43 61 Q 50 67 57 61" fill="none" stroke="${palette.accent}" stroke-width="2" stroke-linecap="round" />`;
      } else if (mouthType === 1) {
        mouthSvg = `<line x1="44" y1="62" x2="56" y2="62" stroke="${palette.accent}" stroke-width="2" stroke-linecap="round" />`;
      } else {
        mouthSvg = `
          <circle cx="50" cy="62" r="2.5" fill="${palette.accent}">
            ${animated ? `<animate attributeName="r" values="2.5;1.5;2.5" dur="2s" repeatCount="indefinite" />` : ''}
          </circle>
        `;
      }

      // Exterior Orbit Rings
      const orbitRingSvg = `
        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#${prefix}grad)" stroke-width="1.8" stroke-dasharray="6 6" opacity="0.75">
          ${animated ? `<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="${rotateSpeed}s" repeatCount="indefinite" />` : ''}
        </circle>
        <circle cx="50" cy="50" r="41" fill="none" stroke="${palette.accent}" stroke-width="1" stroke-dasharray="2 12" opacity="0.6">
          ${animated ? `<animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="${parseFloat(rotateSpeed) * 1.5}s" repeatCount="indefinite" />` : ''}
        </circle>
      `;

      return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" class="y-animated-avatar" data-nickname="${nickname}">
  <defs>
    <linearGradient id="${prefix}grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.start}" />
      <stop offset="100%" stop-color="${palette.end}" />
    </linearGradient>
    <filter id="${prefix}glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Canvas Tile -->
  <rect width="100" height="100" rx="24" fill="${palette.bg}" />

  <!-- Animated Orbit Rings -->
  ${orbitRingSvg}

  <!-- Character Group with Breathing Pulse -->
  <g class="avatar-body" ${animated ? `transform-origin="50 50"` : ''}>
    ${animated ? `<animateTransform attributeName="transform" type="scale" values="1;1.025;1" dur="${breatheSpeed}s" repeatCount="indefinite" transform-origin="50 50" />` : ''}
    ${accessorySvg}
    ${headShapeSvg}
    ${eyesSvg}
    ${mouthSvg}
  </g>
</svg>
      `.trim();
    },

    /**
     * Converts the generated SVG into a Data URI suitable for <img src="..."> or CSS backgrounds.
     * @param {string} nickname 
     * @param {object} options 
     * @returns {string} Data URI
     */
    generateDataUrl(nickname = 'YMaster', options = {}) {
      const svg = this.generateSvg(nickname, options);
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    },

    /**
     * Injects the avatar directly into a DOM container element.
     * @param {HTMLElement|string} target Element or query selector
     * @param {string} nickname 
     * @param {object} options 
     */
    renderAvatar(target, nickname = 'YMaster', options = {}) {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;
      el.innerHTML = this.generateSvg(nickname, options);
    }
  };

  // Export to global / module environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AvatarEngine;
  }
  if (typeof window !== 'undefined') {
    window.YAvatarEngine = AvatarEngine;
  }
})(typeof window !== 'undefined' ? window : global);

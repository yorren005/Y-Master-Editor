const fs = require('fs');

const designMd = `---
name: Foliyo Earthy Editorial
colors:
  surface: '#1c221e'
  surface-dim: '#181d19'
  surface-bright: '#344037'
  surface-container-lowest: '#121613'
  surface-container-low: '#1f2621'
  surface-container: '#242c26'
  surface-container-high: '#2b352d'
  surface-container-highest: '#37443a'
  on-surface: '#f5f0e8'
  on-surface-variant: '#d3c6b5'
  inverse-surface: '#f4eee5'
  inverse-on-surface: '#1c221e'
  outline: '#8a6b4c'
  outline-variant: 'rgba(182, 164, 140, 0.25)'
  surface-tint: '#8e511b'
  primary: '#8e511b'
  on-primary: '#ffffff'
  primary-container: '#423b28'
  on-primary-container: '#f4eee5'
  inverse-primary: '#d39e6a'
  secondary: '#8a6b4c'
  on-secondary: '#ffffff'
  secondary-container: '#332d1e'
  on-secondary-container: '#d3c6b5'
  tertiary: '#b6a48c'
  on-tertiary: '#202721'
  tertiary-container: '#37443a'
  on-tertiary-container: '#faf7f2'
  background: '#1c221e'
  on-background: '#f5f0e8'
  surface-variant: '#2b352d'
typography:
  display-lg:
    fontFamily: Cormorant Garamond
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Cormorant Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Cormorant Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0em
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.005em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.375rem
  md: 0.5rem
  lg: 0.75rem
  xl: 1rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
  space-2xl: 3.5rem
---

## Brand & Style

**Foliyo** is an ultra-refined, earthy editorial document and presentation engineering studio.
`;

const b64 = Buffer.from(designMd, 'utf8').toString('base64');
fs.writeFileSync('scripts/design_md_b64.txt', b64);
console.log('Encoded length:', b64.length);

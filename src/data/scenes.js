export const SCENES = {
  night: {
    key: 'night', name: 'MOONLIT NIGHT', subtitle: 'Aarti under the stars',
    icon: '🌙', color: '#a48cff', colorRGB: '164,140,255', scoreMult: 1.0,
    skyStops: [[0,'#04061a'],[0.28,'#120a30'],[0.52,'#2a1038'],[0.74,'#4d1c3f'],[0.90,'#6b2a3a'],[1,'#3a1420']],
    horizonGlow: 'rgba(255,140,60,0.16)',
    celestial: 'moon', hasStars: true, cloudTint: 'purple',
    houseA: '#1c0f2a', houseB: '#0d0618', roofA: '#2a1338', roofB: '#1c0d29',
    winWarm: '255,186,88', winCool: '120,200,255',
    roadStops: [[0,'#3a2838'],[0.30,'#26182a'],[1,'#120a14']],
    groundStops: [[0,'#1a1028'],[1,'#2a1838']],
    ambient: 'fireflies', ambientColors: [[255,190,90],[255,220,140]], ambientCount: 55,
    fogTint: 'rgba(0,0,0,0)',
    obstacles: { ground: ['pot','flowers','bench','diya'], air: ['bird','lantern'] }
  },
  day: {
    key: 'day', name: 'BRIGHT MORNING', subtitle: 'Sunlit festive streets',
    icon: '☀', color: '#7ec8ff', colorRGB: '126,200,255', scoreMult: 1.15,
    skyStops: [[0,'#4ab8f0'],[0.30,'#78ceff'],[0.55,'#b0e2ff'],[0.78,'#e8f4ff'],[0.92,'#fff3d8'],[1,'#ffe6b8']],
    horizonGlow: 'rgba(255,220,140,0.28)',
    celestial: 'sun', hasStars: false, cloudTint: 'white',
    houseA: '#f0e0c8', houseB: '#d8c8a8', roofA: '#c8642a', roofB: '#a84a1c',
    winWarm: '140,200,255', winCool: '200,235,255',
    roadStops: [[0,'#c8b48c'],[0.30,'#a08c68'],[1,'#5c4830']],
    groundStops: [[0,'#c4b088'],[1,'#8c7654']],
    ambient: 'butterflies', ambientColors: [[255,140,180],[255,220,90],[140,220,255]], ambientCount: 35,
    fogTint: 'rgba(255,240,200,0.06)',
    obstacles: { ground: ['basket','stool','matka','flowers_day'], air: ['butterfly','kite'] }
  },
  evening: {
    key: 'evening', name: 'GOLDEN EVENING', subtitle: 'Aarti at sunset',
    icon: '🌇', color: '#ff8a4a', colorRGB: '255,138,74', scoreMult: 1.30,
    skyStops: [[0,'#1a0a3e'],[0.28,'#5a1c4a'],[0.52,'#a83a3a'],[0.74,'#e87a2a'],[0.90,'#ffb84a'],[1,'#fff0c4']],
    horizonGlow: 'rgba(255,200,120,0.36)',
    celestial: 'sunset', hasStars: false, cloudTint: 'coral',
    houseA: '#3a1a2a', houseB: '#1c0a14', roofA: '#5a2418', roofB: '#3a1408',
    winWarm: '255,180,80', winCool: '255,220,140',
    roadStops: [[0,'#4a2a28'],[0.30,'#381c18'],[1,'#1a0a08']],
    groundStops: [[0,'#3a1c1a'],[1,'#5a2a24']],
    ambient: 'embers', ambientColors: [[255,150,60],[255,200,90]], ambientCount: 60,
    fogTint: 'rgba(255,150,80,0.06)',
    obstacles: { ground: ['claypot','garland','lowwall','diya'], air: ['bat','sparkler'] }
  }
};

export const SCENE_ORDER = ['night', 'day', 'evening'];
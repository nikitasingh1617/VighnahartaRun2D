export const DIFFICULTIES = {
  easy: {
    key:'easy', name:'EASY', icon:'🌸', tagline:'A gentle stroll to Bappa',
    detail:'Forgiving Aarti windows.\nLess crowded routes.',
    color:'#a8e6a0', colorRGB:'168,230,160', dots:1, scoreMul:1.0,
    grace:0.40, speedMul:0.90,
    lengths:[3200,4000,4700,5100,5400],
    rounds:[
      {green:5.0,warn:0.90,red:2.2},{green:4.4,warn:0.80,red:2.1},
      {green:3.8,warn:0.72,red:2.0},{green:3.2,warn:0.64,red:1.9},
      {green:2.7,warn:0.56,red:1.8}
    ],
    obstacleGap:500, obstacleBonus:1,
    airChanceBase:0.10, airChanceStep:0.020
  },
  medium: {
    key:'medium', name:'MEDIUM', icon:'🪔', tagline:'The classic Ganpati run',
    detail:'Balanced cycles.\nThe intended challenge.',
    color:'#ffd24a', colorRGB:'255,210,74', dots:2, scoreMul:1.5,
    grace:0.15, speedMul:1.00,
    lengths:[4500,5800,6900,7400,7700],
    rounds:[
      {green:4.0,warn:0.50,red:3.0},{green:3.3,warn:0.42,red:2.7},
      {green:2.7,warn:0.35,red:2.4},{green:2.2,warn:0.30,red:2.1},
      {green:1.8,warn:0.25,red:1.9}
    ],
    obstacleGap:350, obstacleBonus:2,
    airChanceBase:0.18, airChanceStep:0.045
  },
  hard: {
    key:'hard', name:'HARD', icon:'🔥', tagline:'For the truly devoted',
    detail:'Ruthless windows.\nLong, dense routes.',
    color:'#ff6a6a', colorRGB:'255,106,106', dots:3, scoreMul:2.2,
    grace:0.08, speedMul:1.10,
    lengths:[5500,7000,8300,8900,9300],
    rounds:[
      {green:3.4,warn:0.40,red:3.0},{green:2.8,warn:0.34,red:2.8},
      {green:2.3,warn:0.28,red:2.6},{green:1.9,warn:0.24,red:2.4},
      {green:1.6,warn:0.20,red:2.2}
    ],
    obstacleGap:260, obstacleBonus:2,
    airChanceBase:0.26, airChanceStep:0.055
  }
};
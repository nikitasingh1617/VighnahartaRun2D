import './core/canvas.js';
import './gameplay/rounds.js';
import { installInput } from './core/input.js';
import { startLoop } from './core/loop.js';
import { save } from './core/save.js';

window.__save = save;

installInput();
startLoop();
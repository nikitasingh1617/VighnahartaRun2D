import { drawMenuBackground } from './_background.js';
import { drawInstructionsPanel } from './instructions.js';
import { drawButtons } from '../ui/buttons.js';

export function drawIntroScreen() {
  drawMenuBackground();
  drawInstructionsPanel();
  drawButtons();
}
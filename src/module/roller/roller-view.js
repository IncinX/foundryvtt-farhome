// #todo Should add some simple tests for this file

import { getDieImage } from './roller-util';

export class DieRollView {
  die;
  face;
  imageName;

  constructor(roll, images) {
    this.die = roll.die;
    this.face = roll.face;
    this.imageName = getDieImage(images, this.die, this.face);
  }
}

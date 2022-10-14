// #todo Should add some simple tests for this file

import { getDieImage } from './roller-util';

export class DieRollView {
  die;
  face;
  imageName;
  disableSelection;

  constructor(roll, images, disableSelection = false) {
    this.die = roll.die;
    this.face = roll.face;
    this.imageName = getDieImage(images, this.die, this.face);
    this.disableSelection = disableSelection;
  }
}

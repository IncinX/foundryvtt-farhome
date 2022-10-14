import { getDieImage } from './roller-util';

export class DieRollView {
  die;
  face;
  imageName;
  wasReRoll;
  noSelectionPossible;

  constructor(roll, images, noSelectionPossible = false) {
    this.die = roll.die;
    this.face = roll.face;
    this.imageName = getDieImage(images, this.die, this.face);
    this.noSelectionPossible = noSelectionPossible;
  }
}

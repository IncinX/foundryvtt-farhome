import { getDieImage } from './images';
import { Roll } from './roller';

export class DieRollView {
  die;
  face;
  imageName;
  wasReRoll;
  noSelectionPossible;

  constructor(roll, images, noSelectionPossible = false,
  ) {
    this.die = roll.die;
    this.face = roll.face;
    this.imageName = getDieImage(images, this.die, this.face);
    this.wasReRoll = roll.wasReRoll;
    this.noSelectionPossible = noSelectionPossible;
  }
}
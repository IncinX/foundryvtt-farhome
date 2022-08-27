// #todo Consider using handlebars for all of this, removing mustache dependency and using conditionals like handlebars or mustache to prep and fill content

const base = `
<div class="fh-roller">
  <div>
    {{#flavorText}}
    <span class="flavor-text">{{flavorText}}</span>
    {{/flavorText}}
    <form>
      {{#rolls}}
      <input
        class="{{#wasReRoll}}fh-roller-was-re-roll{{/wasReRoll}}"
        type="checkbox"
        style="background-image: url('systems/farhome/images/{{imageName}}.png')"
        name="roll{{rollIndex}}"
        data-die="{{die}}"
        data-face="{{face}}"
        {{#noSelectionPossible}}disabled="disabled"{{/noSelectionPossible}}
      >
      {{/rolls}}
      {{#canReRoll}}
      <button class="fh-roller-reroll" data-roller="{{system}}">re-roll selected</button>
      {{/canReRoll}}
    </form>
  </div>
  {{#showInterpretation}}
  <hr>
  <div>
    {{> interpretation}}
  </div>
  {{/showInterpretation}}
</div>
`;

export default base;

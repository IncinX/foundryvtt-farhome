// #todo Consider using handlebars for all of this, removing mustache dependency and using conditionals like handlebars or mustache to prep and fill content
// #todo Remove unnecessary stuff like data-roller="{{system}}" below

export const rollTemplate = `
{{#rolls}}
<input
  class="fh-roller-roll"
  type="checkbox"
  style="background-image: url('systems/farhome/images/{{imageName}}.png')"
  data-die="{{die}}"
  data-face="{{face}}"
  {{#noSelectionPossible}}disabled="disabled"{{/noSelectionPossible}}
>
{{/rolls}}
`;

export const baseTemplate = `
<div class="fh-roller">
  <div>
    {{#flavorText}}
    <span class="flavor-text">{{flavorText}}</span>
    {{/flavorText}}
    <form>
      ${rollTemplate}
      {{#canReRoll}}
      <button class="fh-roller-reroll">re-roll selected</button>
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

export const summaryTemplate = `
<div class="fh-roll-summary">
  <ul>
  {{#results}}
      <li>Successes: {{successes}}</li>
      <li>Criticals: {{crits}}</li>
      {{#wounds}}
      <li>Wounds: {{wounds}}</li>
      {{/wounds}}
  {{/results}}
  </ul>
</div>
`;

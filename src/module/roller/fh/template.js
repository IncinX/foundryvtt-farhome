// #todo Consider using handlebars for all of this, removing mustache dependency and using conditionals like handlebars or mustache to prep and fill content

const tpl = `
<div class="fh-roll-summary">
  <ul>
  {{#results}}
      {{#successes}}
      <li>Successes: {{successes}}</li>
      {{/successes}}
      {{#crits}}
      <li>Criticals: {{crits}}</li>
      {{/crits}}
      {{#wounds}}
      <li>Wounds: {{wounds}}</li>
      {{/wounds}}
  {{/results}}
  </ul>
</div>
`;

export default tpl;

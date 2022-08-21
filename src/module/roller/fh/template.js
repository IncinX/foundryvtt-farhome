const tpl = `
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
`;

export default tpl;

import 'isomorphic-fetch'; // #todo Can this be moved to jest.setup.js?
import $ from 'jquery';

global.$ = $;
global.jQuery = $;

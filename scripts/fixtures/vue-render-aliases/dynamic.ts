import * as Vue from 'vue';
const key = 'h';
const render = Vue[key];
export const Widget = () => render('span', 'new');

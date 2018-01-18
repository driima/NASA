// Use font-awesome and bulma
import 'font-awesome/scss/font-awesome.scss'
import 'bulma/css/bulma.css';

// Use lodash
import _ from 'lodash';
import Vue from 'vue';

// Import all of the components needed by the app
import SearchBox from './SearchBox';
import LazyImage from './LazyImage';
import ResultsList from './ResultsList';
import Pager from './Pager';
import App from './App.vue';

Vue.component('search-box', SearchBox);
Vue.component('lazy-image', LazyImage);
Vue.component('results-list', ResultsList);
Vue.component('pager', Pager);

// Truncate and clamp a string
Vue.filter('truncate', (text, stop, clamp) => {
    return text.replace(new RegExp("^(.{" + stop + "}[^\\s]*).*"), "$1") + (
        stop < text.length ? clamp || '...' : ''
    );
});

// Used for VideoControls
Vue.filter('timestamp', (time) => {
    const durationInMinutes = time / 60;
    let seconds = Math.floor((time % 60)) || 0;

    seconds = seconds < 10 ? `0${seconds}` : seconds;

    const minutes = Math.floor(durationInMinutes) || 0;

    return `${minutes}:${seconds}`
});

// Enable axios integration with Vue
window.axios = require('axios');
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
Vue.prototype.$http = window.axios;

const app = new Vue({
    el: '#app',
    render: h => h(App)
});

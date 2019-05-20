import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';
import Promise from 'promise-polyfill';
import './index.css';
import './Animation.css';
import App from './App2';
import 'semantic-ui-css/semantic.min.css';
import registerServiceWorker from './registerServiceWorker';

if (!window.Promise) {
    window.Promise = Promise;
}

let member = ['Alex', 'Chris', 'Depa', 'Keen', 'Tiffany']

console.log(member.map((m)=>({name:m, length:m.length})))

ReactDOM.render(<App />, document.getElementById('root'));

registerServiceWorker();

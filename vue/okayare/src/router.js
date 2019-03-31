import Vue from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import Router from 'vue-router'
import CycleEditor from './views/CycleEditor.vue'
import Signup from './views/Signup.vue'

//import { record } from 'apollo-cache-inmemory';

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
        path: '*',
        redirect: '/editor'
    },
    {
      path: '/editor',
      name: 'cycle-editor',
      component: CycleEditor,
      meta: {
          requiresAuth: true
      }
    },
    {
        path: '/signup',
        name: 'sign-up',
        component: Signup
    },
    {
      path: '/login',
      name: 'login',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/Login.vue')
    }
  ]
});

// to is the target being navigated to
// from is the current route we are leaving
// next set to where we should go
router.beforeEach((to, from, next)=> {
    const currentUser = firebase.auth().currentUser;
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    if (currentUser) {
      console.log("Already logged in:", currentUser);

      let sessionId = localStorage.getItem(window.sessionIdKey);
      if (!sessionId) {
        console.log("No sessionId found, will attempt to generate");
        currentUser.getIdToken().then(idToken => {
          // Send idToken to server to generate a session key
          // https://firebase.google.com/docs/auth/admin/verify-id-tokens
          let endpoint = window.serverEndpoint + '/tokensignin';
          let xhr = new XMLHttpRequest();
          xhr.open('POST', endpoint, false);    // must use sync otherwise xhr.send will continue on to loading the next page
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.onload = function() {
            if (xhr.readyState == 4 && xhr.status == "200") {
              //console.log('Response from serverless: ' + xhr.responseText);
              let params = JSON.parse(xhr.responseText);
  
              // store session key to local storage
              localStorage.setItem(window.sessionIdKey, params.sessionId);  
              console.log("Setting sessionId");
            } else {
              console.log("Unable to generate session ID");

              // TODO: check status and see if we should retry
            }
          };
          xhr.send(JSON.stringify({"idToken": idToken}));

        }).catch(error => {console.log("No id token", error)});

      }
    }

    if (requiresAuth && !currentUser) next('login');
    else if (!requiresAuth && currentUser) next('cycle-edtior');
    else next();
});

export default router;
import Vue from 'vue'
import router from './router'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import 'material-design-icons/iconfont/material-icons.css'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'
import App from './App.vue'
import VueMoment from 'vue-moment';
import firebase from 'firebase/app'
import 'firebase/auth'
import VueSplit from 'vue-split-panel'
import VueNoty from 'vuejs-noty'

//import secrets from '../secrets.json'

Vue.config.productionTip = false

// Initialize Firebase
//firebase.initializeApp(secrets.dev.firebase_config);
console.log("process.env.VUE_APP_SECRETS_JSON", process.env.VUE_APP_SECRETS_JSON);
firebase.initializeApp(process.env.VUE_APP_SECRETS_JSON.firebase_config);


window.sessionIdKey="OKAYARE_SESSION_ID";
window.serverEndpoint = process.env.VUE_APP_SERVER_ENDPOINT

const httpLink = new HttpLink({ uri: window.serverEndpoint + '/graphql' })

const httpLinkAuth = setContext((_, { headers }) => {
  // get the authentication token from localstorage if it exists
  const token = localStorage.getItem(window.sessionIdKey)

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token 
    }
  }
})

// create the apollo client
const apolloClient = new ApolloClient({
  link: httpLinkAuth.concat(httpLink),
  cache: new InMemoryCache()
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient
})

Vue.use(Buefy);
Vue.use(VueMoment);
Vue.use(VueApollo)
Vue.use(VueSplit)
Vue.use(VueNoty, {
  timeout: 2000,
  progressBar: true,
  layout: 'topRight'
})

let app = null;

// instantiate Vue app when firebaes auth is initialized
firebase.auth().onAuthStateChanged(() => {
  if (!app) {
    app = new Vue({
      router,
      apolloProvider,
      render: h => h(App),
    }).$mount('#app')
  }  
});


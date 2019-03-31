<template>
  <div id="app">

    <div id="nav" style="text-align: right;">
      <b-icon icon="account" size="is-small"></b-icon> |
      <button @click="logout">Logout</button>
    </div>

    <router-view/>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/auth'

export default {
  methods: {
    logout() {
      firebase.auth().signOut().then(() => {
        this.$router.replace('login');
        localStorage.removeItem(window.sessionIdKey);
      });
    },
    testing() {
      console.log("VUE_APP_JSON_FILE", process.env.VUE_APP_JSON_FILE);
      console.log("VUE_APP_JSON", process.env.VUE_APP_JSON);
      return process.env.VUE_APP_SECRETS_JSON
    }
  }
}
</script>

<style>
@import '~vuejs-noty/dist/vuejs-noty.css';

  #nav {
    padding: 30px;
  }

  #nav a {
    font-weight: bold;
    color: #2c3e50;
  }

  #nav a.router-link-exact-active button {
    color: #42b983;
  }
</style>

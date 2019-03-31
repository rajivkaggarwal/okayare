<template>
  <div class="sign-up">
    <h3>Sign Up</h3>
    <input type="text" v-model="email" placeholder="you@email.com" /><br/>
    <input type="password" v-model="password" placeholder="password" /><br/>
    <button @click="signup">Sign Up</button>
    <span> or go back to <router-link to="/login">Login</router-link>.</span>
  </div>
</template>


<script>
    import firebase from 'firebase/app'
    import 'firebase/auth'

    export default {
        name: 'signUp',
        data() {
            return {
                email: '',
                password: ''
            }
        },
        methods: {
            signup () {
                firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(
                    (user) => { console.log(user); this.$router.replace('/'); },
                    (err) => { alert("Create failed", err.message) }
                );
            }
        }
    }

</script>
<style scoped>
    .sign-up {
        text-align: center;
        margin-top: 40px;
    }
    input {
        margin: 10px 0;
        width: 20%;
        padding: 15px;
    }
    button {
        margin-top: 20px;
        width: 10%;
        cursor: pointer;
    }
    span {
        display: block;
        margin-top: 20px;
        font-size: 11px;
    }
</style>



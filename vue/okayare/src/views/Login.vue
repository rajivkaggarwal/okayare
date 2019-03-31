<template>
  <div class="login">
    <h3>Sign In</h3>
    <input type="text" v-model="email" placeholder="you@email.com" /><br/>
    <input type="password" v-model="password" placeholder="password" /><br/>
    <button @click="login">Login</button>
    <p>
        Or Via Google:<br/>
            <img @click="googleLogin" alt="Google Logo" src="../assets/btn_google_signin_dark_normal_web.png" />
    </p>
    <p> Don't have an account?  Create one <router-link to="/signup">Here</router-link>.</p>
  </div>
</template>


<script>
    import firebase from 'firebase/app'
    import 'firebase/auth'

    export default {
        name: 'login',
        data() {
            return {
                email: '',
                password: ''
            }
        },
        methods: {
            login() {
                firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(
                    userCredential => { console.log("Login (Email)", userCredential); this.$router.replace('/');  }
                ).catch(error => { alert("Failed: " + error.message) });
            },
            googleLogin() {
                const provider = new firebase.auth.GoogleAuthProvider();
                firebase.auth().signInWithPopup(provider).then(
                    userCredential => { console.log("Login (Google)", userCredential); this.$router.replace('/'); }
                ).catch((err) => { alert("Failed:", err.message)});
            },
        }
    }

</script>
<style scoped>
    .login {
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
    p {
        margin-top: 40px;
        font-size: 13px;
    }
    p a {
        text-decoration: underline;
        cursor: pointer;
    }
</style>




import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEalMh3_0pBhPeoJ2_KBCiL-ZFStQRrnY",
  authDomain: "wdlgeneratorv2-prototype.firebaseapp.com",
  projectId: "wdlgeneratorv2-prototype",
  storageBucket: "wdlgeneratorv2-prototype.firebasestorage.app",
  messagingSenderId: "498361181346",
  appId: "1:498361181346:web:08185af6b53517a590e3fb",
  measurementId: "G-HCZV1TVF1K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign in function
document.getElementById('signInBtn').addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log(result.user);
        })
        .catch((error) => {
            console.error(error);
        });
});

function signInWithEmailPassword() {
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  // [START auth_signin_password]
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
	  console.log("Signed in as" + user);
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
	  console.log(errorMessage);
    });
  // [END auth_signin_password]
}

// Sign out function
/*document.getElementById('signOutBtn').addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log('User signed out');
    }).catch((error) => {
        console.error(error);
    });
});*/

// Listen to authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        //document.getElementById('whenSignedIn').hidden = false;
        //document.getElementById('whenSignedOut').hidden = true;
        //document.getElementById('userDetails').textContent = `Hello, ${user.displayName}. Your UID is: ${user.uid}`;
		console.log("Signed in.");
    } else {
        //document.getElementById('whenSignedIn').hidden = true;
        //document.getElementById('whenSignedOut').hidden = false;
    }
})
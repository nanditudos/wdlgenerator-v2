const firebaseConfig = {
  apiKey: "AIzaSyDEalMh3_0pBhPeoJ2_KBCiL-ZFStQRrnY",
  authDomain: "wdlgeneratorv2-prototype.firebaseapp.com",
  projectId: "wdlgeneratorv2-prototype",
  storageBucket: "wdlgeneratorv2-prototype.firebasestorage.app",
  messagingSenderId: "498361181346",
  appId: "1:498361181346:web:08185af6b53517a590e3fb",
  measurementId: "G-HCZV1TVF1K"
};

firebase.initializeApp(firebaseConfig);

// Sign in function
document.getElementById('signInBtn').addEventListener('click', () => {
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  // [START auth_signin_password]
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Redirect to the main page
    window.location.href = "wdlgenerator.html";
  })
  .catch((error) => {
    console.error(error.message);
  });
  

});


// Listen to authentication state changes
firebase.auth().onAuthStateChanged((user) => {
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
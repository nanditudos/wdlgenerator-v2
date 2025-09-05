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

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      console.log("Welcome", user.email);
      // You can now safely render project UI
    } else {
      // No user is signed in, redirect to login
      window.location.href = "index.html";
    }
});
document.getElementById('signOutBtn').addEventListener('click', () => {
	firebase.auth().signOut().then(() => {
	  window.location.href = "signin.html";
	});
});
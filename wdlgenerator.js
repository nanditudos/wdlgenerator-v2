let userId = "";


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      console.log("Welcome", user.email);
      // You can now safely render project UI
	  userId = user.uid;
    } else {
      // No user is signed in, redirect to login
	  console.log("Welcome", user);
      window.location.href = "index.html";
    }
});
document.getElementById('signOutBtn').addEventListener('click', () => {
	firebase.auth().signOut().then(() => {
	  //window.location.href = "index.html";
	});
});
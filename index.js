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
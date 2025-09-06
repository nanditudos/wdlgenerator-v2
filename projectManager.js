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
document.getElementById('newWDLBtn').addEventListener('click', () => {
	//Some magic to be happening here 
	//await commitWDL(userId,prompt("WDLName","new WDL"),prompt("WDLText","WDLText"))
});
function openWDL(id) {
	
}
async function updateWDLList() {
	const wdls = await queryWDLs(userid);
	let wdlcontainer = document.getElementById("WDLList");
	wdlcontainer.innerHTML="";
	wdls.forEach(function(wdl){
		wdlcontainer.innerHTML+= `<table><tr><td style="text-align:left;">${wdl.name}</td><td style="text-align:right;">
		<button onclick="await deleteWDL(userId,${wdl.id});await updateWDLList();">Delete</button>
		<button onclick="await cloneWDL(userId,${wdl.id});await updateWDLList();">Clone</button>
		<button onclick="open(${wdl.id})">Edit</button>
		</td></tr></table>`
	});
}
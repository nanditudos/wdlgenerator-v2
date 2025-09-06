let userId = "";


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      document.getElementById("logged-in-as-text").innerHTML=`Logged in as ${user.email}.`;
	  userId = user.uid;
	  updateWDLList();
    } else {
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
	window.location.href = `wdlgenerator.html?id=new`;
});
function openWDL(id) {
	window.location.href = `wdlgenerator.html?id=${id}`;
}
async function cloneProject(id) {
	await cloneWDL(userId,id);
	await updateWDLList();
}
async function deleteProject(id) {
	await deleteWDL(userId,id);
	await updateWDLList();
}
async function updateWDLList() {
	const wdls = await queryWDLs(userId);
	let wdlcontainer = document.getElementById("WDLList");
	wdlcontainer.innerHTML="";
	wdls.forEach(function(wdl){
		wdlcontainer.innerHTML+= `<table><tr><td style="text-align:left;">${wdl.name}</td><td style="text-align:right;">
		<button onclick="deleteProject('${wdl.id}')">Delete</button>
		<button onclick="cloneProject('${wdl.id}')">Clone</button>
		<button onclick="openWDL('${wdl.id}')">Edit</button>
		</td></tr></table>`
	});
}
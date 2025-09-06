let userId = "";
let fileId = "";
let wdlData = "";

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      document.getElementById("logged-in-as-text").innerHTML=`Logged in as ${user.email}.`;
	  userId = user.uid;
	  onLoad();
    } else {
      window.location.href = "index.html";
    }
});
document.getElementById('signOutBtn').addEventListener('click', () => {
	firebase.auth().signOut().then(() => {
	  //window.location.href = "index.html";
	});
});

document.getElementById('saveBtn').addEventListener('click', () => {
	await commitWDL(userId,document.getElementById("WDLName").value,document.getElementById("debugInput").value);
});

document.getElementById('exitBtn').addEventListener('click', () => {
	if (!confirm("Are you sure you want to exit. Unsaved changed will be lost.")) return;
	window.location.href = "projectManager.html";
});

document.getElementById('importBtn').addEventListener('click', () => {
	document.getElementById("importFileInput").click();
});

document.getElementById("importFileInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const content = e.target.result;
      //const parsed = JSON.parse(content);  // assuming JSON format
      //console.log("File content:", parsed);
      wdlData=content;
	  document.getElementById("debugInput").value=wdlData;
    } catch (err) {
      console.error("Invalid file format or error parsing:", err);
    }
  };
  reader.readAsText(file);
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const filename = `${document.getElementById("WDLName").value}.json`;

  // Example data object (replace with your actual data)
  const data = document.getElementById("debugInput").value;//change to wdl data later

  // Convert to JSON and create a Blob
  //const jsonStr = JSON.stringify(data, null, 2);
  const jsonStr = data;
  const blob = new Blob([jsonStr], { type: "application/json" });

  // Create a temporary download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  // Cleanup
  URL.revokeObjectURL(url);
});

async function onLoad() {
	//fetch file id from URL
	const params = new URLSearchParams(window.location.search);
	const docId = params.get("id");
	if (docId) {
		if (docId!="new") {
			const currentDocument = await getWDL(userId,docId);
			if (currentDocument) {
				//means a document is found and opened, otherwise new document
				fileId=docId;
				document.getElementById("WDLName").value=currentDocument.name;
				wdlData=currentDocument.data;
				document.getElementById("debugInput").value=wdlData;
				
				//other wdl loading stuff later
			}
		}
	}
}
let userId = "";
let fileId = "";
let wdlData = "";
let taskList = [];

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
	commitWDL(userId,document.getElementById("WDLName").value,document.getElementById("debugInput").value);
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

function getTask(name) {
	let taskdata = {};
	data.taskDefinitions.forEach(function(task){
		if (task.name==name) taskdata=task;
	});
	return taskdata;
}

function getTasksWithInputs(outputlist) {
	let tasks = [];
	data.taskDefinitions.forEach(function(task){
		let matches=true;
		task.inputs.forEach(function(input){
			if (input.type=="input") {
				if (!outputlist.includes(input.value)) matches=false;
			}
		});
		if (mathces) {
			tasks.push(task.name);
		}
	});
	return tasks;
}

function addTask(number,template) {
	taskList.push(template);
	const taskdata = getTask(template);
	const innerName = `${taskdata.type}_${number}`
	let field=document.getElementById(`subtaskField${number}`);
	field.innerHTML+=`<div id="${innerName}_nameField">${taskdata.text}</div>`;
	field.innerHTML+=`<div id="${innerName}_inputField">`;
	taskdata.inputs.forEach(function(input){
		switch (input.type) {
			case "input":
				break;
			case "selection":
				field.innerHTML+=`<label for="${innerName}_${input.name}">${input.text}</label>`;
				field.innerHTML+=`<select id="${innerName}_${input.name}" ${input.value?`value="${input.value}"`:``}>`;
				input.options.forEach(function(select_option){
					field.innerHTML+=`<option value="${select_option.value}">${select_option.text}</option>`;
				});
				field.innerHTML+=`</label>`;
				break;
			case "number":
				field.innerHTML+=`<label for="${innerName}_${input.name}">${input.text}</label>`;
				field.innerHTML+=`<input type="number" id="${innerName}_${input.name}" ${input.value?`value="${input.value}"`:``} ${input.min?`min="${input.min}"`:``} ${input.max?`max="${input.max}"`:``}>`;
				break;
			case "textarea":
				field.innerHTML+=`<label for="${innerName}_${input.name}">${input.text}</label>`;
				field.innerHTML+=`<textarea id="${innerName}_${input.name}" ${input.value?`value="${input.value}"`:``} rows=${input.rows?input.rows:4} cols=${input.cols?input.cols:4}>`;
				break;
		}
		field.innerHTML+=`<div id="inputField${number}">`;
	});
	field.innerHTML+=`</div>`;
	field.innerHTML+=`<div id="${innerName}_deleteField"><button id="${innerName}_deleteButton" onclick="${`deleteTask(${number})`}">Remove</button></div>`;
	field.innerHTML+=`<div id="addTaskField${number}">`;
	let outputs = [];
	taskdata.outputs.forEach(function(output){
		if (output.type=="output") outputs.push(output.value);
	});
	const adderTasks = getTasksWithInputs(outputs);
	for (var i=0; i<adderTasks.length; i++) {
		field.innerHTML+=`<button onclick="addTask(${number+1},'${adderTasks[i]}')">Add ${getTask(adderTasks[i]).text}</button>`;
	}
	field.innerHTML+=`</div>`;
	field.innerHTML+=`<div id="subtaskField${number+1}"></div>`;
	
	document.getElementById(`addTaskField${number-1}`).style.display="none";
	
}

function deleteTask(number) {
	document.getElementById(`subtaskField${number}`).innerHTML="";
	document.getElementById(`addTaskField${number-1}`).style.display="block";
	taskList=taskList.slice(0,number);

	
}
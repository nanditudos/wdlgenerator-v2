let userId = "";
let fileId = "";
//let wdlData = "";
let taskList = [];

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      //User is signed in
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
	//commitWDL(userId,document.getElementById("WDLName").value,document.getElementById("debugInput").value);JSON.stringify(data, null, 2)
	commitWDL(userId,document.getElementById("WDLName").value,JSON.stringify(generateWDLData()));
});

document.getElementById('exitBtn').addEventListener('click', () => {
	if (!confirm("Are you sure you want to exit. Unsaved changed will be lost.")) return;
	window.location.href = "projectManager.html";
});

document.getElementById('importBtn').addEventListener('click', () => {
	document.getElementById("importFileInput").click();
});

document.getElementById('generateWDLBtn').addEventListener('click', () => {
	exportWDL();
});

document.getElementById('generateInputFileBtn').addEventListener('click', () => {
	exportInputFile();
});

document.getElementById("importFileInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const content = e.target.result;
      const parsed = JSON.parse(content);
	  buildFromWDLData(parsed);
      //console.log("File content:", parsed);
      //wdlData=content;
	  //document.getElementById("debugInput").value=wdlData;
    } catch (err) {
      console.error("Invalid file format or error parsing:", err);
    }
  };
  reader.readAsText(file);
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const filename = `${document.getElementById("WDLName").value}.json`;

  //const data = document.getElementById("debugInput").value;//change to wdl data later
  const data = generateWDLData();
  const jsonStr = JSON.stringify(data, null, 2);
  //const jsonStr = data;
  const blob = new Blob([jsonStr], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

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
				const parsed = JSON.parse(currentDocument.data);
				buildFromWDLData(parsed);
				//wdlData=currentDocument.data;
				//document.getElementById("debugInput").value=wdlData;
				
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
		if (matches) {
			tasks.push(task.name);
		}
	});
	return tasks;
}

function addTask(number,template) {
	taskList.push(template);
	const taskdata = getTask(template);
	const innerName = `${taskdata.name}_${number}`
	let field=document.getElementById(`subtaskField${number}`);
	let textBuilder="";
	textBuilder+=`<div id="${innerName}_blockCoverField class="task-block" ">`;
	textBuilder+=`<div id="${innerName}_nameField">${taskdata.text}</div>`;
	textBuilder+=`<div id="${innerName}_inputField">`;
	taskdata.inputs.forEach(function(input){
		switch (input.type) {
			case "input":
				break;
			case "selection":
				textBuilder+=`<label for="${innerName}_${input.name}">${input.text}</label><br>`;
				textBuilder+=`<select id="${innerName}_${input.name}" ${input.value?`value="${input.value}"`:``}>`;
				input.options.forEach(function(select_option){
					textBuilder+=`<option value="${select_option.value}">${select_option.text}</option>`;
				});
				textBuilder+=`</select><br>`;
				break;
			case "number":
				textBuilder+=`<label for="${innerName}_${input.name}">${input.text}</label><br>`;
				textBuilder+=`<input type="number" id="${innerName}_${input.name}" value=${input.value?input.value:0} ${input.min?`min="${input.min}"`:``} ${input.max?`max="${input.max}"`:``}><br>`;
				break;
			case "textarea":
				textBuilder+=`<label for="${innerName}_${input.name}">${input.text}</label><br>`;
				textBuilder+=`<textarea id="${innerName}_${input.name}" ${input.value?`value="${input.value}"`:``} rows=${input.rows?input.rows:4} cols=${input.cols?input.cols:50}></textarea><br>`;
				break;
		}
	});
	textBuilder+=`</div>`;
	textBuilder+=`<div id="${innerName}_deleteField"><button id="${innerName}_deleteButton" onclick="${`deleteTask(${number})`}">Remove</button></div>`;
	textBuilder+=`<div id="addTaskField${number}">`;
	let outputs = [];
	taskdata.outputs.forEach(function(output){
		if (output.type=="output") outputs.push(output.value);
	});
	const adderTasks = getTasksWithInputs(outputs);
	for (var i=0; i<adderTasks.length; i++) {
		textBuilder+=`<button onclick="addTask(${number+1},'${adderTasks[i]}')">Add ${getTask(adderTasks[i]).text}</button>`;
	}
	textBuilder+=`</div>`;
	textBuilder+=`</div>`;
	textBuilder+=`<divid="subtaskField${number+1}"></div>`;
	
	field.innerHTML=textBuilder;
	
	document.getElementById(`addTaskField${number-1}`).style.display="none";
	
}

function deleteTask(number) {
	document.getElementById(`subtaskField${number}`).innerHTML="";
	document.getElementById(`addTaskField${number-1}`).style.display="block";
	taskList=taskList.slice(0,number-1);
}

function generateWDLData() {
	let outWDLData = {"name":document.getElementById("WDLName").value,"tasks":[],"version":0};
	for (var i=0; i<taskList.length; i++) {
		const taskdata = getTask(taskList[i]);
		let adder = {"name":taskList[i]};
		taskdata.inputs.forEach(function(input){
			if (input.type!="input") {
				adder[input.name]=document.getElementById(`${taskList[i]}_${i+1}_${input.name}`).value;
			}
		});
		outWDLData.tasks.push(adder);
	}
	return outWDLData;
}

function buildFromWDLData(wdlData) {
	switch (wdlData.version) {
		case 0:
			document.getElementById("WDLName").value = wdlData.name;
			var i=1;
			wdlData.tasks.forEach(function(task){
				addTask(i,task.name);
				const taskdata = getTask(task.name);
				taskdata.inputs.forEach(function(input){
					if (input.type!="input") {
						document.getElementById(`${taskList[i-1]}_${i}_${input.name}`).value=task[input.name];
					}
				});
				i+=1;
			});
			break;
		default:
			alert("Invalid or outdated wdl format.");
	}
}

function exportWDL() {
	const data = WDLGenerator.generateWDL(generateWDLData());
	console.log(data);
}

function exportInputFile() {
	const data = JSON.stringify(WDLGenerator.generateInputFile(generateWDLData()), null, 2);
	console.log(data);
}
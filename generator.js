
function reduceString(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '');
}

class WDLGenerator {
	
	static generateWDL(WDLData) {
		let output = "";
		const reducedWDLName = reduceString(WDLData.name);
		let currentFiles = [];
		const iteratorList = ["i","j","k","l","m","n"];
		let scatterDepth = 0;
		
		output+=`version 1.0\n`;
		//generate imports and structs
		let imports = new Set();
		let structs = new Set();
		for (var i=1; i<WDLData.tasks.length; i++) {
			const task = WDLData.tasks[i];
			const taskData = getTask(task.name);
			if (taskData.wdl.generator.imports) {
				for (var j=0; j<taskData.wdl.generator.imports.length; j++) {
					imports.add(taskData.wdl.generator.imports[j])
				}
			}
			if (taskData.wdl.generator.structs) {
				for (var j=0; j<taskData.wdl.generator.structs.length; j++) {
					structs.add(taskData.wdl.generator.structs[j])
				}
			}
		}
		for (const x of imports) {
			output+=`import ${x}\n`;
		}
		for (const x of structs) {
			output+=`${x}\n`;
		}
		
		//generate workflow
		output+=`workflow ${reducedWDLName} {\n`;
		output+=`  input {\n`;
		switch (WDLData.tasks[0].name) {
			case "multiFileInput_S":
				output+=`    Array[String] files\n`;
				currentFiles.push({"name":"RAW_FASTA","array":true,"caller_core":"files"})
				break;
			case "multiFileInput_P":
				output+=`    Array[Array[String]] files\n`;
				currentFiles.push({"name":"RAW_FASTA_FORWARD","array":true,"caller_core":"files","caller_access":"[0]"})
				currentFiles.push({"name":"RAW_FASTA_REVERSE","array":true,"caller_core":"files","caller_access":"[1]"})
				break;
		}
		output+=`  }\n`;
		for (var i=1; i<WDLData.tasks.length; i++) {
			const task = WDLData.tasks[i];
			const taskData = getTask(task.name);
			const taskName = `${WDLData.tasks[i].name}_${i+1}`;
			let inputs = [];
			taskData.inputs.forEach(function(input){
				if (input.type=="input") {
					currentFiles.forEach(function(current){
						if (input.value==current.name) {
							let adder = {"name":input.name,"value":current,"array":(input.array?input.array:false),"passed":(input.passed?input.passed:false)};
							if (input.access) {
								adder.caller_access=input.access;
							}
							inputs.push(adder);
						}
					});
				}
			});
			currentFiles=[];
			console.log(inputs);
			inputs.forEach(function(current){
				if (current.passed) {
					let adder = {current};//Important: If you make nested object later in currentFile format then you need to change this to a deep copy instead of a shallow copy
					adder.passed=false;
					currentFiles.push(adder);
				}
			});
			console.log(inputs);
			const scatter = !inputs[0].array && inputs[0].value.array;
			if (scatter) {
				output+=`  scatter (${iteratorList[scatterDepth]} in range(length(${inputs[0].value.caller_core}))) {\n`;
				output+=`    call ${taskName} {\n`;
				output+=`      input:\n`;
				inputs.forEach(function(input){
					output+=`        ${input.name} = ${input.value.caller_core}[${iteratorList[scatterDepth]}]${inputs[0].value.caller_access?inputs[0].value.caller_access:""}\n`;
				});
				output+=`    }\n`;
				output+=`  }\n`;
				if (taskData.outputs) taskData.outputs.forEach(function(out){
					const isArray = out.array?out.array:false;
					if (isArray) {
						console.error("Warning! Nested arrays used. Might result in undefined behavior.");
						currentFiles.push({"name":out.value,"array":true,"caller_core":`${taskName}.${out.name}`});
					} else {
						currentFiles.push({"name":out.value,"array":true,"caller_core":`${taskName}.${out.name}`});
					}
				});
			} else {
				output+=`  call ${taskName} {\n`;
				output+=`    input:\n`;
				inputs.forEach(function(input){
					output+=`      ${input.name} = ${input.value.caller_core}${inputs[0].value.caller_access?inputs[0].value.caller_access:""}\n`;
				});
				output+=`  }\n`;
				if (taskData.outputs) taskData.outputs.forEach(function(out){
					const isArray = out.array?out.array:false;
					if (isArray) {
						currentFiles.push({"name":out.value,"array":true,"caller_core":`${taskName}.${out.name}`});
					} else {
						currentFiles.push({"name":out.value,"array":false,"caller_core":`${taskName}.${out.name}`});
					}
				});
			}
			
		}
		//output+=`\n`;
		output+=`}\n`;
		
		//generate tasks
		for (var i=1; i<WDLData.tasks.length; i++) {
			const task = WDLData.tasks[i];
			const taskData = getTask(task.name);
			const taskName = `${WDLData.tasks[i].name}_${i+1}`;
			if (taskData.wdl.generator) {
				let adder = "";
				adder+=`task ${taskName} {\n`;
				if (taskData.wdl.generator.inputs) {
					adder+=`  input {\n`;
					for (var j=0; j<taskData.wdl.generator.inputs.length; j++) {
						adder+=`    ${taskData.wdl.generator.inputs[j]}\n`;
					}
					adder+=`  }\n`;
				}
				if (taskData.wdl.generator.private_declarations) {
					for (var j=0; j<taskData.wdl.generator.private_declarations.length; j++) {
						adder+=`  ${taskData.wdl.generator.private_declarations[j]}\n`;
					}
				}
				if (taskData.wdl.generator.command) {
					adder+=`  command <<<\n`;
					for (var j=0; j<taskData.wdl.generator.command.length; j++) {
						adder+=`    ${taskData.wdl.generator.command[j]}\n`;
					}
					adder+=`  >>>\n`;
				}
				if (taskData.wdl.generator.outputs) {
					adder+=`  output {\n`;
					for (var j=0; j<taskData.wdl.generator.outputs.length; j++) {
						adder+=`    ${taskData.wdl.generator.outputs[j]}\n`;
					}
					adder+=`  }\n`;
				}
				if (taskData.wdl.generator.requirements) {
					adder+=`  requirements {\n`;
					for (var j=0; j<taskData.wdl.generator.requirements.length; j++) {
						adder+=`    ${taskData.wdl.generator.requirements[j]}\n`;
					}
					adder+=`  }\n`;
				}
				if (taskData.wdl.generator.hints) {
					adder+=`  hints {\n`;
					for (var j=0; j<taskData.wdl.generator.hints.length; j++) {
						adder+=`    ${taskData.wdl.generator.hints[j]}\n`;
					}
					adder+=`  }\n`;
				}
				if (taskData.wdl.generator.meta) {
					adder+=`  meta {\n`;
					for (var j=0; j<taskData.wdl.generator.meta.length; j++) {
						adder+=`    ${taskData.wdl.generator.meta[j]}\n`;
					}
					adder+=`  }\n`;
				}
				if (taskData.wdl.generator.parameter_meta) {
					adder+=`  parameter_meta {\n`;
					for (var j=0; j<taskData.wdl.generator.parameter_meta.length; j++) {
						adder+=`    ${taskData.wdl.generator.parameter_meta[j]}\n`;
					}
					adder+=`  }\n`;
				}
				adder+=`}\n`;
				output+=adder;
			}
			
		}
		
		
		
		return output;
	}
	
	static generateInputFile(WDLData) {
		let output = {};
		const reducedWDLName = reduceString(WDLData.name);
		switch (WDLData.tasks[0].name) {
			case "multiFileInput_S":
				output[`${reducedWDLName}.files`]=WDLData.tasks[0].INPUT.trim().split(/\s+/);
				break;
			case "multiFileInput_P":
				const listofInputs=WDLData.tasks[0].INPUT.trim().split(/\s+/);
				output[`${reducedWDLName}.files`]=[];
				for (var i=0; i<listofInputs.length; i+=2) {
					output[`${reducedWDLName}.files`].push([listofInputs[i],listofInputs[i+1]]);
				}
				break;
		}
		for (var i=1; i<WDLData.tasks.length; i++) {
			const task = WDLData.tasks[i];
			const taskData = getTask(task.name);
			taskData.inputs.forEach(function(input){
				if (input.type!="input") {
					output[`${reducedWDLName}.${WDLData.tasks[i].name}_${i+1}.${input.name}`]=WDLData.tasks[i][input.name];
				}
			});
		}
		return output;
		
	}
}
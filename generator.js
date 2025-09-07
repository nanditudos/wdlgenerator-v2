

class WDLGenerator {
	
	static generateWDL(WDLData) {
		
	}
	
	static generateInputFile(WDLData) {
		let output = {};
		switch (WDLData.tasks[0].name) {
			case "multiFileInput_S":
				output[`${WDLData.name}.files`]=WDLData.tasks[0].INPUT.trim().split(/\s+/);
				break;
			case "multiFileInput_P":
				const listofInputs=WDLData.tasks[0].INPUT.trim().split(/\s+/);
				output[`${WDLData.name}.files`]=[];
				for (var i=0; i<listofInputs.length; i+=2) {
					output[`${WDLData.name}.files`].push([listofInputs[i],listofInputs[i+1]]);
				}
				break;
		}
		for (var i=1; i<WDLData.tasks.length; i++) {
			const task = WDLData.tasks[i];
			const taskData = getTask(task.name);
			taskData.inputs.forEach(function(input){
				if (input.type!="input") {
					output[`${WDLData.name}.${WDLData.tasks[i].name}_${i+1}.${input.name}`]=WDLData.tasks[i][input.name];
				}
			});
		}
		return output;
		
	}
}
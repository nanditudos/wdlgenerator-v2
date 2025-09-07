const db = firebase.firestore();

async function queryWDLs(userid) {
  const snapshot = await db.collection("users").doc(userid).collection("wdls").get();
  const wdls = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    wdls.push({ id: doc.id, name: data.name, data: data.data });
  });
  return wdls;
}

async function deleteWDL(userid, id) {
	if (!confirm("Are you sure you want delete the WDL?")) return;
	await db.collection("users").doc(userid).collection("wdls").doc(id).delete()
	  .then(() => {
		console.log("WDL deleted.");
	  });
}

async function commitWDL(userid, name, data) {
	if (await checkIfNameUsed(userid, name)) {
		if (!confirm(`The WDL ${name} already exists. Do you want to overwrite it?`)) return;
		const id = (await getWDLByName(userid,name)).id;
		await db.collection("users").doc(userid).collection("wdls").doc(id).set({"data":data,"name":name});
		console.log("WDL written.");
		return;
	}
	db.collection("users").doc(userid).collection("wdls").add({"name":name,"data":data})
    .then((docRef) => {
      console.log("Config saved with ID:", docRef.id);
    });
}

async function getWDL(userid, id) {
  const snapshot = await db.collection("users").doc(userid).collection("wdls").doc(id).get();
  if (!snapshot.exists) return null;
  return snapshot.data();//the structure containing the data and the name is returned on purpose
}

async function getWDLByName(userid, name) {
  const snapshot = await db.collection("users")
    .doc(userid)
    .collection("wdls")
    .where("name", "==", name)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data();
  
  return { id: snapshot.docs[0].id, name: data.name, data: data.data };
}

async function checkIfNameUsed(userid, name) {
	const snapshot = await db.collection("users")
    .doc(userid)
    .collection("wdls")
    .where("name", "==", name)
    .get();

  if (snapshot.empty) return false;
  return true;
}

async function cloneWDL(userid, id) {
	const clonable = await getWDL(userid,id);
	let newName = prompt("Enter new name for cloned project",`${clonable.name} (copy)`);
	if (await checkIfNameUsed(userid,newName)) {
		alert(`The name "${newName}" is already in use. Choose a different name, or delete the project with the mathcing name.`);
		return;
	}
	console.log("WDL cloned.");
	await commitWDL(userid,newName,(await getWDL(userid,id)).data);
}
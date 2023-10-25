importScripts(["/assets/idb.js"]);

const graderAPIBase = "http://172.232.157.242:3130"; //"http://localhost:3130";

const IndexedDb = new IDB("AutoGrader", 8);
async function getSubmissions() {
  const user = await IndexedDb.get("user", "status", "active");
  const assignements = await IndexedDb.getAll("assignments");

  const courses = await IndexedDb.getAll("courses");
  const autoGradable = courses.filter(c => c.autograde);
  await fetch(`${graderAPIBase}/users/auth`, {
    method: "POST",
    body:JSON.stringify({authtoken: user.token}),
    headers:{"Content-Type":"application/json"}
  });
  /* autoGradable.forEach(course => {
    fetch(`${graderAPIBase}/grade`, {
      method: "POST",
      body: JSON.stringify({
        course: course.id,
        user: user.id,
        assignments: assignements.map(a => a.id)
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`
      }
    })
    // api.post(`${graderAPIBase}/grade`, , { Authorization: `Bearer ${user.token}` })
  }) */;

}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  console.log("Installed");

});

self.addEventListener('activate', function (e) {
  // console.log('Activate Event:', e);

  const swReg = self.registration;
  swReg.periodicSync.getTags().then(tags => {
    console.log(tags)
    if (!tags.includes("auto-grade")) {
      navigator.permissions.query({
        name: 'periodic-background-sync'
      }).then(status => {
        if (status.state === 'granted') {
          swReg.periodicSync.register("auto-grade", {
            minInterval: 1000, // * 60
            powerState: 'avoid-draining',
            networkState: 'avoid-cellular'
          }).then(console.log)
        }
      }).catch(e => {
        console.log(e);
      });
    }
  })
});

self.addEventListener("periodicsync", event => {
  console.log("doing it")
  if (event.tag === "auto-grade") {
    console.log(IndexedDb);
    event.waitUntil(getSubmissions());
  }
})

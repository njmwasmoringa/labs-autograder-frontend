
  
  self.addEventListener("install", (event) => {
    console.log("Installed")
  });

  self.addEventListener("sync", event=>{
    if(event.tag === "auto-grade"){
        event.waitUntil((()=>new Promise((rs, rj)=>{
            setTimeout(()=>{
                rs("Done")
            }, 5000);
        }))());
    }
  })
  
import { createContext, useEffect, useState } from "react";

async function registerServiceWorker() {
    const swReg = await navigator.serviceWorker.register('/grader.sw.js?version=1');
    if (swReg.installing) {
        console.log("Service worker installing");
    } else if (swReg.waiting) {
        console.log("Service worker installed");
    } else if (swReg.active) {
        console.log("Service worker active");
    }
}

export const ServiceWorkerContext = createContext();
export default function ServiceWorkerProvider({ children }) {

    const [swReg, setSwReg] = useState();

    useEffect(()=>{
        registerServiceWorker();
        navigator.serviceWorker.ready.then(setSwReg);
    }, []);

    return (<ServiceWorkerContext.Provider value={swReg}>{children}</ServiceWorkerContext.Provider>);
}
import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../user.provider";

export const WorkerContext = createContext({ worker: window.socketWorker });
export default function WorkerProvider({ children }) {

    const [workerMessage, setWorkerMessage] = useState();
    const worker = window.socketWorker;
    const [user] = useContext(UserContext);

    useEffect(() => {
        worker.addEventListener("message", messageListener);
        return () => worker.removeEventListener("message", messageListener);
    }, []);

    useEffect(() => {
        if (user) {
            worker.postMessage({ action: "connect", auth: { accessToken: user.token } });
        }
    }, [user]);

    function messageListener({ data }) {
        if (typeof data === "object") setWorkerMessage(data);
    }

    return (<WorkerContext.Provider value={{ worker, workerMessage }}>{children}</WorkerContext.Provider>);
}

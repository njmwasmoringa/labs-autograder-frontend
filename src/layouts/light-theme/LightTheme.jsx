import "./light-theme.css";
import { Outlet } from "react-router-dom";
import Nav from 'react-bootstrap/Nav';
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/user.provider";
import { WorkerContext } from "../../context/socket-worker/worker.context";

export default function LightTheme() {

    const [serviceStatus, setServiceStatus] = useState("");
    const [user] = useContext(UserContext);
    const { workerMessage } = useContext(WorkerContext);

    useEffect(() => {
        if (workerMessage && workerMessage.as === "serviceState") {
            // console.log(workerMessage);
            setServiceStatus(workerMessage.status);
        }
    }, [workerMessage]);

    return (<>
        <header className="container d-flex justify-content-between align-items-center">
            <div>
                <h1>Auto Grader</h1>
                <small>v1.0</small>
            </div>
            <div className="d-flex align-items-center">
                <span>Auto Grading Status:</span>
                <h4><span className={`badge bg-${serviceStatus === 'idle' ? 'light text-dark' : 'success'}`}>{serviceStatus}</span></h4>
            </div>
        </header>

        <main className="d-flex justify-content-streach">
            {/* {user && <aside>
                <Nav defaultActiveKey="/home" className="flex-column">
                    <Nav.Link href="/home">Active</Nav.Link>
                    <Nav.Link eventKey="link-1">Link</Nav.Link>
                    <Nav.Link eventKey="link-2">Link</Nav.Link>
                    <Nav.Link eventKey="disabled" disabled>
                        Disabled
                    </Nav.Link>
                </Nav>
            </aside>} */}

            <section className="flex-fill container d-flex flex-column justify-content-center">
                <Outlet />
            </section>
        </main>
    </>);
}
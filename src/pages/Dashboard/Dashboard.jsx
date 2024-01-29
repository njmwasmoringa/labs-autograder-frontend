import { useContext, useEffect, useRef, useState } from "react"
import { IndexedDbContext } from "../../context/indexeddb.provider"
import { useNavigate } from "react-router-dom";
import API from "../../services/api.service";
import { UserContext } from "../../context/user.provider";
import Submissions from "./Submissions";
import { ServiceWorkerContext } from "../../context/serviceworker.provider";
import { ModalContext } from "../../context/modal.provider";
import { WorkerContext } from "../../context/socket-worker/worker.context";
import { Dropdown, Modal } from "react-bootstrap";
import ManualGrade from "../../components/ManualGrade";
import StudentsProgress from "../../components/StudentsProgress";

export default function Dashboard() {

    const Idb = useContext(IndexedDbContext);
    const [user, setUser] = useContext(UserContext);
    const [modalData, setModalData] = useContext(ModalContext);
    const swReg = useContext(ServiceWorkerContext);
    const [courses, setCourses] = useState();
    const [course, setCourse] = useState();
    const [submissions, setSubmissions] = useState([]);
    const [serviceStatus, setServiceStatus] = useState("");
    const [assignments, setAssignments] = useState();
    const [selectAssignment, setSelectAssignment] = useState();
    const [assignments2Grade, setAssignments2Grade] = useState([]);
    const api = new API("grader");
    const navigate = useNavigate();
    const { worker, workerMessage } = useContext(WorkerContext);
    const responsesDiv = useRef();

    useEffect(() => {

        if (!user) {
            navigate("/setup");
        }

        if (!courses && user) {

            worker.postMessage({
                action: "send",
                as: "serviceState",
                payload: {
                    userService: `${user.id}-servicestate`
                }
            });

            Idb.getAll("courses").then(allCourses => {
                if (allCourses.length === 0) {
                    // navigate("/setup");
                    syncCourses();
                }
                else {
                    setCourses(allCourses);
                    allCourses.map(c => {
                        if (c.autograde) {
                            worker.postMessage({
                                action: "send",
                                as: "grade",
                                payload: {
                                    usercourse: `${user.id}-any`,
                                    payload: {
                                        course: c.id,
                                        user: user.id
                                    }
                                }
                            });

                            /* api.post("/grade", JSON.stringify({
                                course: c.id,
                                user: user.id
                            }), { Authorization: `Bearer ${user.token}` }) */
                        }
                    });
                }
            });
        }

    }, [user, courses]);

    useEffect(() => {
        if (workerMessage) {
            console.log(workerMessage);
            switch (workerMessage.as) {
                case "grade":
                    if ("submissions" in workerMessage) {

                    }
                    /* if ("submission" in workerMessage) {
                        console.log(workerMessage)
                        const iOfs = submissions.findIndex(s => s.id === workerMessage.submission.id);
                        if (iOfs === -1) {
                            setSubmissions(prev => [...prev, {
                                ...workerMessage.submission,
                                responses: [workerMessage.responseText.replace(/\\\n/g, <br />)]
                            }]);
                        }
                        else {
                            let responseText = workerMessage.responseText
                            if (!prevMsg || !prevMsg.includes("**-----js_test_report-------**")) {
                                setSubmissions(prev => {
                                    const ps = [...prev];
                                    ps.splice(iOfs, 1, {
                                        ...workerMessage.submission,
                                        responses: ps[iOfs].responses.concat([responseText])
                                    })
                                    return ps;
                                });
                            }
                            else {
                                // console.log(JSON.parse(responseText))
                            }
                            setPrevMsg(responseText);
                        }

                        if (responsesDiv) {
                            responsesDiv.current.scrollTop = responsesDiv.current.scrollHeight;
                        }
                    } */
                    break;

                case "connect":
                    if(!serviceStatus || serviceStatus === ""){
                        api.post(`/users/auth`, JSON.stringify({ authtoken: user.token }));
                    }
                break;

                case "serviceState":
                    setServiceStatus(workerMessage.status);
                    if (assignments2Grade.length > 0) {
                        worker.postMessage({
                            action: "send",
                            as: "grade",
                            payload: {
                                usercourse: `${user.id}-any`,
                                payload: {
                                    action: "run",
                                    course: course.id,
                                    user: user.id,
                                    assignments: [...assignments2Grade.map(a => a.id)]
                                }
                            }
                        });

                        setAssignments2Grade([]);
                    }
                    break;
            }
        }
    }, [workerMessage]);

    function handleAssignmentSelection(evt) {
        const chbox = evt.target;
        const assId = chbox.value;

        const assignmnt = assignments.find(a => a.id === Number(assId));
        console.log(assignmnt, assId);
        if (chbox.checked && assignmnt) {
            setAssignments2Grade([...assignments2Grade, assignmnt]);
        }
        else {
            const assIndex = assignments2Grade.findIndex(a => a.id === assId);
            setAssignments2Grade(prev => {
                let asprev = [...prev];
                asprev.splice(assIndex, 1);
                return asprev;
            });
        }
    }

    async function handleSelectionClose() {
        console.log(assignments2Grade);

        await Idb.saveManyData("assignments", assignments2Grade);

        setSelectAssignment(undefined);
        const updatedCOurse = { ...course, autograde: true }
        setCourse(updatedCOurse);

        await Idb.saveData("courses", updatedCOurse);
        const allCourses = await Idb.getAll("courses");
        setCourses(allCourses);

        console.log("status", serviceStatus);
        if (!serviceStatus || serviceStatus === "") {
            console.log(user);
            try {
                await api.post(`/users/auth`, JSON.stringify({ authtoken: user.token }));
            }
            catch (e) {
                console.log(e);
                return;
            }

            return;

            /* const getStatus = ()=>serviceStatus;

            await new Promise((rs)=>{ 
                let interval = setInterval(()=>{
                    console.log(getStatus());
                    if(getStatus() && getStatus() !== ""){
                        clearInterval(interval);
                        interval = undefined;
                        rs("done");
                    }
                }, 1000);
            });
            console.log(worker); */
        }

        worker.postMessage({
            action: "send",
            as: "grade",
            payload: {
                usercourse: `${user.id}-any`,
                payload: {
                    action: "run",
                    course: course.id,
                    user: user.id,
                    assignments: [...assignments2Grade.map(a => a.id)]
                }
            }
        });

        setAssignments2Grade([]);

    }

    function handleAutoGrade(evt) {

        const btn = evt.target;
        btn.disabled = true;
        btn.innerHTML = "Getting assignments...";

        Idb.getAll("assignments").then(selectedAssignments => {
            setAssignments2Grade(selectedAssignments);
            api.get(`/assignments/${course.id}?page=1&per_page=1000`, {
                Authorization: `Bearer ${user.token}`
            }).then(remoteAssignments => {
                console.log(remoteAssignments);
                btn.disabled = false;
                btn.innerHTML = "Auto Grade";
                const allAssignements = remoteAssignments.reduce((a, assignment) => {
                    if (assignment.published) {
                        a.push({
                            ...assignment,
                            selected: selectedAssignments.find(a => assignment.id === a.id) != null
                        });
                    }
                    return a;
                }, []);
                setAssignments(allAssignements);
                setSelectAssignment(true);
            })
                .catch(e => console.log(e))
        });

    }

    function syncCourses() {
        api.get("/courses", { Authorization: `Bearer ${user.token}` })
            .then(canvasCourses => {
                setCourses(canvasCourses);
                Idb.saveManyData("courses", canvasCourses);
            })
    }

    return (<section className="mb-auto">
        <hr className="divider" />

        <Modal show={selectAssignment !== undefined}>
            <Modal.Header closeButton>
                <Modal.Title>Select assignments</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Select the assignement to auto grade</p>
                <div style={{ maxHeight: "450px", overflow: "hidden", overflowY: "auto" }}>
                    {assignments ? <ul className="list-group list-group-flush">
                        {assignments.map(asmnt => <li className="list-group-item" key={asmnt.id}>
                            <input className="form-check-input me-1" type="checkbox"
                                defaultChecked={asmnt.selected}
                                value={asmnt.id} id={`firstCheckbox${asmnt.id}`} onChange={handleAssignmentSelection} />
                            <label className="form-check-label" htmlFor={`firstCheckbox${asmnt.id}`}>{asmnt.name}</label>
                        </li>)}
                    </ul> : <p>Loading...</p>}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn" onClick={() => setSelectAssignment(undefined)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleSelectionClose}>
                    Auto Grade Selected
                </button>
            </Modal.Footer>
        </Modal>

        <div className="d-md-flex flex-md-row">
            {courses && <>
                <div className="list-group list-group-flush d-none d-md-inline w-25">
                    <div className="list-group-item">
                        <div className="d-flex justify-content-between">
                            <h4>Courses</h4>
                            <button type="button" className="btn" onClick={syncCourses}>Sync Courses</button>
                        </div>
                        <p>Select the courses you want to grade</p>
                    </div>
                    {courses.map(c => <a href="#" key={c.id}
                        className={`list-group-item ${course && course.id === c.id ? "active" : ""} list-group-item-action`}
                        onClick={() => setCourse(c)}>{c.name}</a>)}
                </div>
                <div className=" mb-3 d-md-none">
                    <div className="d-flex justify-content-between">
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                                {course ? course.name : "Select Course"}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {courses.map(c => <Dropdown.Item key={c.id}
                                    onClick={() => setCourse(c)}>{c.name}</Dropdown.Item>)}
                            </Dropdown.Menu>
                        </Dropdown>

                        <button type="button" className="btn" onClick={syncCourses}>Sync Courses</button>
                    </div>
                </div>
            </>}

            <div ref={responsesDiv} className="ps-3 border-start border-primary flex-fill">

                {course ? <>
                    <Submissions {...{ course }}>
                        <div className="d-flex align-items-center">
                            <div className="me-2">
                                <button type="button"
                                    onClick={handleAutoGrade}
                                    className="btn btn-primary"
                                >{!course.autograde ? 'Auto Grade' : 'Edit Assignments'}</button>
                            </div>
                            <div className="me-2">
                                <button className="btn btn-light" onClick={() => {
                                    setModalData({
                                        title: "Manual Grade",
                                        body: <ManualGrade {...{ course }} onGradeStart={() => setModalData(undefined)} />
                                    });
                                }}>Manual Grade</button>
                            </div>
                            <div>
                                <button className="btn btn-light" onClick={() => {
                                    setModalData({
                                        fullScreen: true,
                                        title: "Progress Tracker",
                                        body: <StudentsProgress {...{ course }} onGradeStart={() => setModalData(undefined)} />
                                    });
                                }}>Student Progress</button>
                            </div>
                        </div>
                    </Submissions></> 
                    : <div className="d-flex flex-column justify-content-center h-100 align-items-center">
                        <h3>Select a course or add one</h3>
                        </div>}
            </div>
        </div>
    </section >)
}
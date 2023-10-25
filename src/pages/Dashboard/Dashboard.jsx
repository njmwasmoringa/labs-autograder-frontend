import { useContext, useEffect, useRef, useState } from "react"
import { IndexedDbContext } from "../../context/indexeddb.provider"
import { useNavigate } from "react-router-dom";
import API from "../../services/api.service";
import { UserContext } from "../../context/user.provider";
import Submissions from "./Submissions";
import { ServiceWorkerContext } from "../../context/serviceworker.provider";
import { ModalContext } from "../../context/modal.provider";
import { WorkerContext } from "../../context/socket-worker/worker.context";
import { Modal } from "react-bootstrap";
import ManualGrade from "../../components/ManualGrade";

export default function Dashboard() {

    const Idb = useContext(IndexedDbContext);
    const [user] = useContext(UserContext);
    const [modalData, setModalData] = useContext(ModalContext);
    const swReg = useContext(ServiceWorkerContext);
    const [courses, setCourses] = useState();
    const [course, setCourse] = useState();
    const [submissions, setSubmissions] = useState([]);
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
                    api.get("/courses", { Authorization: `Bearer ${user.token}` })
                        .then(canvasCourses => {
                            setCourses(canvasCourses);
                            Idb.saveManyData("courses", canvasCourses);
                        })
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

    function handleSelectionClose() {
        console.log(assignments2Grade);
        Idb.saveManyData("assignments", assignments2Grade).then(() => {
            setSelectAssignment(undefined);
            const updatedCOurse = { ...course, autograde: true }
            setCourse(updatedCOurse);
            Idb.saveData("courses", updatedCOurse).then(() => {
                Idb.getAll("courses").then(allCourses => {
                    setCourses(allCourses);
                    /* api.post("/grade", JSON.stringify({
                        course: course.id,
                        user: user.id,
                        assignments: assignments2Grade.map(a=>a.id)
                    }), { Authorization: `Bearer ${user.token}` })
                        .then(gradeREsponse => {
                            console.log(gradeREsponse);
                            worker.postMessage({
                                action: "send",
                                as: "grade",
                                payload: {
                                    usercourse: `${user.id}-${course.id}`,
                                    payload: {
                                        action: "run",
                                        course: course.id,
                                        user: user.id,
                                        assignments: assignments2Grade.map(a=>a.id)
                                    }
                                }
                            });
                        })
                        .catch(console.log) */
                });
            });
            worker.postMessage({
                action: "send",
                as: "grade",
                payload: {
                    usercourse: `${user.id}-any`,
                    payload: {
                        action: "run",
                        course: course.id,
                        user: user.id,
                        assignments: assignments2Grade.map(a => a.id)
                    }
                }
            });
        });
        /* const assignementIds = assignments2Grade.map(a=>a.id);
        api. */
    }

    function handleAutoGrade(evt) {

        const btn = evt.target;
        btn.disabled = true;
        btn.innerHTML = "Getting assignments...";

        Idb.getAll("assignments").then(selectedAssignments => {
            api.get(`/assignments/${course.id}?page=1&per_page=1000`, {
                Authorization: `Bearer ${user.token}`
            }).then(remoteAssignments => {
                console.log(remoteAssignments);
                btn.innerHTML = "Auto Grade";
                const allAssignements = remoteAssignments.map(assignment => {
                    return {
                        ...assignment,
                        selected: selectedAssignments.find(a => assignment.id === a.id) != null
                    }
                });
                setAssignments(allAssignements);
                setSelectAssignment(true);
            })
                .catch(e => console.log(e))
        });


        /* const updatedCOurse = { ...course, autograde: true }
        setCourse(updatedCOurse);
        Idb.saveData("courses", updatedCOurse).then(() => {
            Idb.getAll("courses").then(allCourses => {
                setCourses(allCourses);
            });
        });

        api.post("/grade", JSON.stringify({
            course: course.id,
            user: user.id
        }), { Authorization: `Bearer ${user.token}` })
            .then(gradeREsponse => {
                console.log(gradeREsponse);
                worker.postMessage({
                    action: "send",
                    as: "grade",
                    payload: {
                        usercourse: `${user.id}-${course.id}`,
                        payload: {
                            course: course.id,
                            user: user.id
                        }
                    }
                });
            })
            .catch(console.log) */

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

        <div className="d-flex">
            {courses && <div className="list-group list-group-flush flex-fill">
                <div className="list-group-item">
                    <h4>Courses</h4>
                    <p>Select the courses you want to grade</p>
                </div>
                {courses.map(c => <a href="#" key={c.id}
                    className={`list-group-item ${course && course.id === c.id ? "active" : ""} list-group-item-action`}
                    onClick={() => setCourse(c)}>{c.name}</a>)}
            </div>}

            <div ref={responsesDiv} className="ps-3 border-start border-primary w-75">
                {course && <>
                    {/* <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <a className="nav-link" href=""></a>
                        </li>
                    </ul> */}
                <Submissions {...{ course }}>
                    <div className="d-flex align-items-center">
                        <div className="me-2">
                            <button type="button"
                                onClick={handleAutoGrade}
                                className="btn btn-primary"
                                disabled={course.autograde === true}
                            >Auto Grade</button>
                        </div>
                        <div>
                            <button className="btn btn-light" onClick={()=>{
                                setModalData({
                                    title:"Manual Grade",
                                    body: <ManualGrade {...{course}} />
                                });
                            }}>Manual Grade</button>
                        </div>
                    </div>
                </Submissions></>}
            </div>
        </div>
    </section >)
}
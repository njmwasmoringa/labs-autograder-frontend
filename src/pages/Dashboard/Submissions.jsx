import { useContext, useEffect, useState } from "react";
import { IndexedDbContext } from "../../context/indexeddb.provider";
import API from "../../services/api.service";
import { UserContext } from "../../context/user.provider";
import { WorkerContext } from "../../context/socket-worker/worker.context";
import { Accordion, Card } from "react-bootstrap";

export default function Submissions({ children, course }) {

    const [selectedCourse, setSelectedCourse] = useState(course);
    const [submissions, setSubmissions] = useState();
    const Idb = useContext(IndexedDbContext);
    const [user] = useContext(UserContext);
    const api = new API("grader");
    const { worker, workerMessage } = useContext(WorkerContext);

    useEffect(() => {
        setSelectedCourse(course);
        if (!submissions && user) {
            Idb.getAll("submissions", { index: "isGraded", keyRange: "no" }).then(ungradedSubmissions => {
                console.log(ungradedSubmissions);
                /* if (ungradedSubmissions.length === 0) {
                    Idb.getAll("assignments").then(allAssignements=>{
                        if(allAssignements.length > 0){
                            const assignemntIds = allAssignements.map(a=>a.id);
                            api.get(`/submissions/${course.id}?assignments=${assignemntIds.join()}`, {
                                Authorization: `Bearer ${user.token}`
                            }).then(cSubmissions => {
                                console.log(cSubmissions);
                                Idb.saveManyData("submissions", cSubmissions);
                                setSubmissions(cSubmissions);
                            })
                                .catch(e => console.log(e))
                        }
                    });
                } */
                setSubmissions(ungradedSubmissions);
            });
        }
    }, [course, submissions, user]);

    useEffect(() => {
        if (workerMessage) {
            switch (workerMessage.as) {
                case "grade":
                    if ("submission" in workerMessage) {
                        console.log(workerMessage)
                        const iOfs = submissions.findIndex(s => s.id === workerMessage.submission.id);
                        if (iOfs === -1) {
                            setSubmissions(prev => [...prev, {
                                ...workerMessage.submission,
                                prevMsg: workerMessage.responseText,
                                responses: [workerMessage.responseText.replace(/\\\n/g, <br />)]
                            }]);
                        }
                        else {
                            const prevMsg = submissions[iOfs].prevMsg;
                            let responseText = workerMessage.responseText
                            if ((!prevMsg || !prevMsg.includes("**-----js_test_report-------**") && responseText != "End")) {
                                setSubmissions(prev => {
                                    const ps = [...prev];
                                    ps.splice(iOfs, 1, {
                                        ...workerMessage.submission,
                                        prevMsg: workerMessage.responseText,
                                        responses: (ps[iOfs].responses || []).concat([responseText])
                                    })
                                    return ps;
                                });
                            }
                            else {
                                // console.log(JSON.parse(responseText))
                                const sIndex = submissions.findIndex(s => s.id === workerMessage.submission.id);
                                if (sIndex > -1) {
                                    const submission = submissions[sIndex];
                                    Idb.saveData("submissions", { ...submission, isGraded: "yes", responseText });
                                    setSubmissions(p => {
                                        const sbs = [...p];
                                        sbs.splice(sIndex, 1);
                                        return sbs;
                                    })
                                }
                            }

                            const responsesDiv = document.querySelector(`#card${submissions[iOfs].id}`);
                        if (responsesDiv) {
                            responsesDiv.scrollTop = responsesDiv.scrollHeight;
                        }
                        }
                    }

                    if ("submissions" in workerMessage) {
                        console.log(workerMessage.submissions);
                        setSubmissions(workerMessage.submissions.filter(s=>s.assignment.course_id === selectedCourse.id));
                    }
                break;

            }
        }
    }, [workerMessage]);

    return (<div>
        <h4>Course: {course.name}</h4>
        <p>This course submissions and grading progress</p>
        {children}
        <div className="mt-3 border-top" style={{
            maxHeight: "calc(100dvh - 300px)",
            overflow: "hidden",
            overflowY: "auto"
        }}>

            {submissions && <Accordion defaultActiveKey={0}>
                {submissions.map((subm, i) => <Accordion.Item eventKey={i} key={subm.id}>
                <Accordion.Header>
                    {subm.assignment.name} For {subm.user.name} :- {subm.prevMsg}
                </Accordion.Header>
                <Accordion.Body>
                    {subm.responses && subm.responses.map((response, i) => <div key={`${subm.id}-${i}`} id={`card${subm.id}`}>
                        {response}
                    </div>)}
                </Accordion.Body>
            </Accordion.Item>)}
            </Accordion>}
        </div>
    </div>);
}
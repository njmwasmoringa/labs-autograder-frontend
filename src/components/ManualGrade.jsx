import { useContext, useEffect, useState } from "react";
import { IndexedDbContext } from "../context/indexeddb.provider";
import API from "../services/api.service";
import { UserContext } from "../context/user.provider";
import { WorkerContext } from "../context/socket-worker/worker.context";
import { ModalContext } from "../context/modal.provider";

export default function ManualGrade({ course, onGradeStart }) {

    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState();
    const [selectedSubmissions, setSelectedSubmissions] = useState([]);
    const [inProgress, setInProgress] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        assignment: null,
        workflow: "submitted"
    });
    const Idb = useContext(IndexedDbContext);
    const api = new API("grader");
    const [user] = useContext(UserContext);
    const { worker } = useContext(WorkerContext);
    const m = useContext(ModalContext);

    useEffect(() => {
        Idb.getAll("assignments").then(setAssignments);
        setInProgress(JSON.parse(localStorage.getItem("manualGradingQuee") || "[]"));
    }, []);

    useEffect(() => {
        getSubmission();
    }, [formData.assignment, formData.workflow])

    function handleSubmit(evt) {
        evt.preventDefault();
        const form = evt.target;

        const users = submissions.reduce((selectedUsers, submission) => {
            if (selectedSubmissions.includes(`${submission.id}`)) {
                selectedUsers.push(submission.user.id);
            }
            return selectedUsers;
        }, []);

        worker.postMessage({
            action: "send",
            as: "grade",
            payload: {
                usercourse: `${user.id}-any`,
                payload: {
                    action: "manual-grade-submissions",
                    course: course.id,
                    users,
                    assignment: formData.assignment
                }
            }
        });
        if(m) m.setModalData(undefined);
        if(onGradeStart) onGradeStart();
    }

    function handleFields(evt) {
        console.log(evt.target.name, evt.target.value)
        setFormData(() => ({ ...formData, [evt.target.name]: evt.target.value }));
    }

    function getSubmission() {

        if (!formData.assignment) return;
        setLoading(true);
        setSubmissions([]);

        api.get(`/submissions/${course.id}?assignments=${formData.assignment}&workflow=${formData.workflow}`, {
            Authorization: `Bearer ${user.token}`
        })
            .then(data => {
                console.log(data)
                setSubmissions(data);
            })
            .catch(e => console.log(e))
            .finally(()=>setLoading(false))
    }

    function handleSubmissionSelection(evt) {
        setSelectedSubmissions(prev => {
            const selected = [...prev];
            const index = selected.findIndex(id => id === evt.target.value);
            if (evt.target.checked && index === -1) {
                selected.push(evt.target.value);
            }
            else if (index > -1 && !evt.target.checked) {
                selected.splice(index, 1);
            }
            return selected;
        });
    }

    return (<form onSubmit={handleSubmit}>
        <p>Add an assignment url below</p>
        <div className="form-group mb-3">
            <select name="assignment" id="" className="form-control" onChange={handleFields}>
                <option value="">Select assignment</option>
                {assignments.map((assignment) => <option key={assignment.id} value={assignment.id}>
                    {assignment.name}
                </option>)}
            </select>
        </div>
        <div className="mb-3">
            <div className="btn-group" role="group" aria-label="Types">
                <input type="radio"
                    className="btn-check"
                    name="workflow"
                    id="ungraded"
                    onChange={handleFields}
                    value={"submitted"}
                    checked={formData.workflow === "submitted"}
                    autoComplete="off" />
                <label className="btn btn-outline-primary" htmlFor="ungraded">Ungraded</label>

                <input type="radio"
                    className="btn-check"
                    name="workflow" id="graded"
                    value={"graded"}
                    onChange={handleFields}
                    checked={formData.workflow === "graded"}
                    autoComplete="off" />
                <label className="btn btn-outline-primary" htmlFor="graded">Graded</label>
            </div>
        </div>
        {loading && <p align="center">Loading...</p>}
        {selectedSubmissions.length > 0 && <div className="pb-2 pt-2">{selectedSubmissions.length} Selected</div>}
        {submissions && <div style={{ maxHeight: "300px", overflow: "hidden", overflowY: "auto" }}>
            <strong>Select Submissions to grade</strong>
            <ul className="list-group list-group-flush">
                {submissions.map(subm => <li key={subm.id} className="list-group-item">
                    <input className="form-check-input me-1"
                        type="checkbox"
                        disabled={inProgress.includes(`${subm.id}`)}
                        onChange={handleSubmissionSelection} value={subm.id} id={`sub${subm.id}`} />
                    <label className="form-check-label" htmlFor={`sub${subm.id}`}>
                        <h6>{subm.user.name}</h6>
                        <div><span>Grade: {subm.grade}</span></div>
                        {subm.submission_comments.map((comment, i)=><p key={comment.id}>{comment.comment}</p>)}
                    </label>
                </li>)}
            </ul>
        </div>}
        <hr className="divider" />
        <div className="">
            <button className="btn btn-primary" disabled={submissions == undefined || selectedSubmissions.length === 0}>
                Grade selected
            </button>
        </div>
    </form>);
}
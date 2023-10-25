import { useContext, useEffect, useState } from "react"
import { IndexedDbContext } from "../../context/indexeddb.provider"
import { UserContext } from "../../context/user.provider";
import API from "../../services/api.service";
import { useNavigate } from "react-router-dom";

export default function SetUp() {
    const Idb = useContext(IndexedDbContext);
    const [user] = useContext(UserContext);
    const [selectedCourses, setSelectedCourses] = useState();
    const [courses, setCourses] = useState();
    const [submissions, setSubmissions] = useState();
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const api = new API("grader");

    useEffect(() => {
        if (!user) {
            navigate("/")
        }
        else if (!courses) {
            Idb.getAll("courses").then(gradedCourses=>{
                setSelectedCourses(gradedCourses.map(c=>c.id));
            }).then(() => {
                return api.get("/courses", { Authorization: `Bearer ${user.token}` })
            })
            .then(canvasCourses=>{
                console.log(canvasCourses);
                setCourses(canvasCourses);
            })
            .catch(e=>{
                console.log(e);
            });
        }

    }, [courses, submissions]);

    return (<section className="mb-auto">
        <h3>Setup</h3>

        <div className="d-flex">
            {courses && <ul className="list-group list-group-flush">
                <li className="list-group-item">
                    <h4>Courses {courses.length}</h4>
                    <p>Select the courses you want to grade</p>
                </li>
                {courses.map(course=><li key={course.id} className="list-group-item">
                    <input className="form-check-input me-1" 
                        type="checkbox" 
                        value={course.id} 
                        id={`course-${course.id}`}
                        checked={selectedCourses.includes(course.id)}
                        onChange={()=>setSelectedCourses([...selectedCourses, course.id])}
                    />
                    <label className="form-check-label" htmlFor={`course-${course.id}`}>{course.name}</label>
                </li>)}
            </ul>}
        </div>

    </section>)
}
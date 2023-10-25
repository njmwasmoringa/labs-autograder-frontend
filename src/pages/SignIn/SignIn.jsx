import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/user.provider";
import API from "../../services/api.service";
import { ModalContext } from "../../context/modal.provider";
import { useNavigate } from "react-router-dom";

export default function SignIn() {

    const [user, setUser] = useContext(UserContext);
    const [, setModalData] = useContext(ModalContext);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const canvasApi = new API("grader");

    useEffect(()=>{
        if(user){
            navigate("/dashboard")
        }
    }, [user]);

    function handleAuth(event) {
        event.preventDefault();
        const form = event.target;
        const formData = { authtoken: form.authToken.value }
        setLoading(true);
        canvasApi.post(`/users/auth`, JSON.stringify(formData))
            .then(user => {
                setUser({...user, status:"active", token: form.authToken.value});
            })
            .catch(e=>{
                setModalData({
                    title: "Error",
                    body: e.message
                })
            }).finally(()=>setLoading(false))
    }

    return (<form onSubmit={handleAuth} className="align-self-center p-5 rounded shadow-sm">

        <h2>Sign In</h2>

        <div className="form-group mb-3">
            <label>Enter your canvas authorization token</label>
            <input type="password" name="authToken" className="form-control" />
        </div>
        <div>
            <button className="btn btn-primary" disabled={loading}>Authenticate</button>
        </div>
    </form>);
}
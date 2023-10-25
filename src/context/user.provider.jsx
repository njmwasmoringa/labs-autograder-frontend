import { createContext, useContext, useEffect, useState } from "react";
import { IndexedDbContext } from "./indexeddb.provider";

export const UserContext = createContext();

export default function UserProvider({children}){
    const [user, setUser] = useState();
    const IndexedDb = useContext(IndexedDbContext);

    useEffect(()=>{
        if(user){
            console.log("Signed In")
            IndexedDb.saveData("user", user)
        }
        else{
            IndexedDb.get("user", "status", "active")
                .then(setUser)
                .catch(e=>console.log(e))
        }
    }, [user])

    return (<UserContext.Provider value={[user, setUser]}>{children}</UserContext.Provider>);
}
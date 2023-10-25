import { createContext } from "react";
import IDB from "../services/indexdb.service";

const IndexedDb = new IDB("AutoGrader", 8, [{
        name: "user",
        params: { keyPath: "status" },
        indexes: [{ name: "status", keyPath: "status" }]
    },
    {
        name: "courses",
        params: { keyPath: "id" },
        indexes: [
            { name: "id", keyPath: "id", options:{unique:true} },
            { name: "autograde", keyPath: "autograde" }
        ]
    },
    {
        name: "submissions",
        params: { keyPath: "assignment_id"},
        indexes: [
            { name: "assignment_id", keyPath: "assignment_id", options:{unique:true} },
            { name: "user_id", keyPath: "user_id" },
            { name: "isGraded", keyPath: "isGraded" },
        ]
    },
    {
        name: "assignments",
        params: { keyPath: "id"},
        indexes: [
            { name: "id", keyPath: "id", options:{unique:true} }
        ]
    },
    {
        name: "submissions_page",
        params: { keyPath: "page"}
    }
]);

export const IndexedDbContext = createContext(IndexedDb);

export default function IndexDBProvider({ children }) {

    return (<IndexedDbContext.Provider value={IndexedDb}>
        {children}
    </IndexedDbContext.Provider>);

}
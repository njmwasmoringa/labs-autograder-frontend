import servers from "../configs.json";

export default class API{

    requestHeaders = {
        "Content-Type":"application/json"
    }

    constructor(server = "grader"){
        this.BASE_URL = servers[server];
    }

    async get(path, headers){
        const response = await fetch(`${this.BASE_URL}${path}`, {headers});
        if(response.status !== 200)
            throw new Error(response.statusText);

        return await response.json();
    }

    async post(path, body, headers){
        console.log(body);
        const response = await fetch(`${this.BASE_URL}${path}`, {
            method:"POST", 
            body, 
            headers:{...this.requestHeaders, ...headers}
        });
        if(response.status !== 200)
            throw new Error(response.statusText);

        return await response.json();
    }

    async update(path, body, headers){
        const response = await fetch(`${this.BASE_URL}${path}`, { method:"PATCH",body, headers});
        if(response.status !== 200)
            throw new Error(response.statusText);

        return await response.json();
    }
    
}
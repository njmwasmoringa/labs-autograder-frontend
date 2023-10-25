'use strict';

/* eslint-disable no-restricted-globals */
import { io } from "socket.io-client";
import servers from "../../configs.json";

const actions = {
    socket: null,
    auth: null,
    connect(auth, port) {
        this.auth = auth;
        console.log(`${servers.grader}`.replace('http', 'ws'));
        if (auth) {
            this.socket = io(`${servers.grader}`.replace('http', 'ws'), {
                auth: { token: auth.accessToken }
            });

            this.socket.on("connect", () => {
                console.log("Connected", this.socket.id);
                // self.postMessage({as:"connect", socketId:this.socket.id});
            });

            this.socket.on("connect_error", err => {
                console.log(err);
                
            });

            this.socket.on("serviceState", (status) => {
                // console.log(status);
                self.postMessage({ as: "serviceState", ...status });
            });

            this.socket.on("grade", data => {
                // console.log(data);
                self.postMessage({ as: "grade", ...data });
            });

            this.socket.on("disconnected", () => {
                // console.log(data);
                console.log("Disconnected");
            });
        }
    },

    disconnect() {
        if (this.socket) this.socket.disconnect();
    },

    send(message, port) {
        console.log(this.auth, this.socket, message);
        if (this.socket) {
            this.socket.emit(...Object.values(message), (response) => {
                self.postMessage(response);
            })
        }
        self.postMessage("test");
    }
}

self.addEventListener("message", ({ data, ports }) => {
    const { action } = data;
    delete data.action;
    // console.log(data);
    if (action && action in actions) actions[action](data, ...ports);
});
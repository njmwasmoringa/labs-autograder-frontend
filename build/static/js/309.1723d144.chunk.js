!function(){"use strict";var t={6309:function(t,e,n){var o=n(9062),c=n(1413),r=n(801),s=JSON.parse('{"grader":"https://autograderapi.picpazz.com"}'),i={socket:null,auth:null,connect:function(t,e){var n=this;this.auth=t,console.log("".concat(s.grader).replace("http","ws")),t&&(this.socket=(0,r.io)("".concat(s.grader).replace("http","ws"),{auth:{token:t.accessToken}}),this.socket.on("connect",(function(){console.log("Connected",n.socket.id)})),this.socket.on("connect_error",(function(t){console.log(t)})),this.socket.on("serviceState",(function(t){self.postMessage((0,c.Z)({as:"serviceState"},t))})),this.socket.on("grade",(function(t){self.postMessage((0,c.Z)({as:"grade"},t))})),this.socket.on("disconnected",(function(){console.log("Disconnected")})))},disconnect:function(){this.socket&&this.socket.disconnect()},send:function(t,e){var n;(console.log(this.auth,this.socket,t),this.socket)&&(n=this.socket).emit.apply(n,(0,o.Z)(Object.values(t)).concat([function(t){self.postMessage(t)}]));self.postMessage("test")}};self.addEventListener("message",(function(t){var e=t.data,n=t.ports,c=e.action;delete e.action,c&&c in i&&i[c].apply(i,[e].concat((0,o.Z)(n)))}))}},e={};function n(o){var c=e[o];if(void 0!==c)return c.exports;var r=e[o]={exports:{}};return t[o](r,r.exports,n),r.exports}n.m=t,n.x=function(){var t=n.O(void 0,[365],(function(){return n(6309)}));return t=n.O(t)},function(){var t=[];n.O=function(e,o,c,r){if(!o){var s=1/0;for(f=0;f<t.length;f++){o=t[f][0],c=t[f][1],r=t[f][2];for(var i=!0,a=0;a<o.length;a++)(!1&r||s>=r)&&Object.keys(n.O).every((function(t){return n.O[t](o[a])}))?o.splice(a--,1):(i=!1,r<s&&(s=r));if(i){t.splice(f--,1);var u=c();void 0!==u&&(e=u)}}return e}r=r||0;for(var f=t.length;f>0&&t[f-1][2]>r;f--)t[f]=t[f-1];t[f]=[o,c,r]}}(),n.d=function(t,e){for(var o in e)n.o(e,o)&&!n.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:e[o]})},n.f={},n.e=function(t){return Promise.all(Object.keys(n.f).reduce((function(e,o){return n.f[o](t,e),e}),[]))},n.u=function(t){return"static/js/"+t+".c0685250.chunk.js"},n.miniCssF=function(t){},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.p="/",function(){var t={309:1};n.f.i=function(e,o){t[e]||importScripts(n.p+n.u(e))};var e=self.webpackChunkauto_grader_ui=self.webpackChunkauto_grader_ui||[],o=e.push.bind(e);e.push=function(e){var c=e[0],r=e[1],s=e[2];for(var i in r)n.o(r,i)&&(n.m[i]=r[i]);for(s&&s(n);c.length;)t[c.pop()]=1;o(e)}}(),function(){var t=n.x;n.x=function(){return n.e(365).then(t)}}();n.x()}();
//# sourceMappingURL=309.1723d144.chunk.js.map
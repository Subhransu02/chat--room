const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const fs = require("fs");

//Number of connected client
var nbPersonnes = 0;

io.on("connection", socket => {
    //On disconnect
    socket.on('disconnect', () => {
        if (socket.username !== undefined) { 
            log("Disconnected (Closing the browser or client)");
            nbPersonnes--; 

            if (socket.room !== undefined) { 
                io.to(socket.room).emit('new message system', socket.username + " has left the chat"); 
                logAdmin("(" + socket.room + ") : " + socket.username + " left the chat (Closing the browser or client)"); 

                socket.to(socket.room).emit('stop typing', {
                    username: socket.username
                });
                
                let sockets = Object.keys(io.sockets.sockets); 
                if (sockets.length > 0) {
                    io.to(sockets[0]).emit("update users rooms"); 
                }
            }
        }
    });

    //User logged
    socket.on('add user', (username) => {
        if (socket.username != null) return; 

        socket.username = username; 
        nbPersonnes++; 

        socket.broadcast.emit("send personnes", nbPersonnes); 

        log("Login"); 
    });

    //User logged out
    socket.on('remove user', () => {
        if (socket.username == null) return; 

        socket.broadcast.emit("send personnes", nbPersonnes); 

        socket.username = undefined; 
        socket.leaveAll(); 
        nbPersonnes--; 

        log("Logout"); 
    });

    //Send username to the client
    socket.on("get user", () => {
        socket.emit("send user", {
            username: socket.username
        })
    });

    //Send counter of connected people to the client
    socket.on("get personnes", () => {
        socket.emit("send personnes", nbPersonnes);
    })

    //Send all username of connected user in the room
    socket.on("get personnes room", (room) => {
        let users = {}; 

        if (io.sockets.adapter.rooms[room] !== undefined) { 
            let sockets = io.sockets.adapter.rooms[room].sockets; 
            for (const [key, value] of Object.entries(sockets)) { 
                users[io.sockets.connected[key].username] = value; 
            }
        }

        socket.emit("send personnes room", users);
    });


    socket.on("clear", () => {
        socket.emit("clear");
    });

    //Count how many users are in rooms
    socket.on("get personnes rooms broadcast", () => {
        var roomsPers = {}; 

        fs.readFile("data/rooms.json", (err, rawdata) => { 
            if (err) {
                logAdmin("Can't access to rooms file");
                socket.emit("error");
            } else {
                let rooms = JSON.parse(rawdata);

                for(let key of Object.keys(rooms)) { 
                    roomsPers[key] = 0; 
                    if (io.sockets.adapter.rooms[key] !== undefined) { 
                        let sockets = io.sockets.adapter.rooms[key].sockets; 
                        for (let value of Object.values(sockets)) {
                            if (value) {
                                roomsPers[key]++;
                            }
                        }
                    }
                }

                
                io.emit("send personnes rooms", roomsPers);
            }
        });
    });

   
    socket.on("get personnes rooms", () => {
        var roomsPers = {};

        fs.readFile("data/rooms.json", (err, rawdata) => { 
            if (err) {
                logAdmin("Can't access to rooms file");
                socket.emit("error");
            } else {
                let rooms = JSON.parse(rawdata);

                for(let key of Object.keys(rooms)) { 
                    roomsPers[key] = 0; 
                    if (io.sockets.adapter.rooms[key] !== undefined) { 
                        let sockets = io.sockets.adapter.rooms[key].sockets; 
                        for (let value of Object.values(sockets)) {
                            if (value) {
                                roomsPers[key]++; 
                            }
                        }
                    }
                }

             
                socket.emit("send personnes rooms", roomsPers);
            }
        });
    });

    //User join a room
    socket.on("join room", (room) => {
        if (socket.username != null) { 
            socket.join(room); 
            socket.room = room; 
            log("Joined the chat \"" + room + "\""); 

            io.to(room).emit('new message system', socket.username + " has joined the chat"); 
            logAdmin("(" + room + ") : " + socket.username + " joined the chat"); 

            socket.emit("update users rooms"); 
        }
    });

    //User leave room
    socket.on("leave room", (room) => {
        if (socket.username != null) { 
            socket.leave(room); 
            socket.room = undefined; 
            log("Left the chat \"" + room + "\""); 

            io.to(room).emit('new message system', socket.username + " has left the chat"); 
            logAdmin("(" + room + ") : " + socket.username + " left the chat"); 

            socket.emit("update users rooms"); 
        }
    });

    //New message sent
    socket.on('send message', (room, message) => {
        if (socket.username != null) { 
            log("new message (" + room + ") : " + message); 
            socket.to(room).emit('new message', { 
                username: socket.username,
                message: message,
            });
        }
    });

    //Get all rooms
    socket.on('get rooms', () => {
        fs.readFile("data/rooms.json", (err, rawdata) => { 
            if (err) logAdmin("Can't access to rooms file");
            else {
                let rooms = JSON.parse(rawdata);

                socket.emit('send rooms', rooms);
            }
        });
    });

    //Get specif room
    socket.on('get room', (id) => {
        fs.readFile("data/rooms.json", (err, rawdata) => { 
            if (err) logAdmin("Can't access to rooms file");
            else {
                let rooms = JSON.parse(rawdata);

                socket.emit('send room', (rooms[id] !== undefined ? rooms[id] : null)); 
            }
        });
    });

    socket.on('typing', () => {
        if (socket.username != null && socket.room != null) {
            log("Start typing");
            socket.to(socket.room).emit('typing', {
                username: socket.username
            });
        }
    });


    socket.on('stop typing', () => {
        log("Stop typing");
        if (socket.username != null && socket.room != null) {
            socket.to(socket.room).emit('stop typing', {
                username: socket.username
            });
        }
    });

    
    function log(message) {
        console.log("#" + socket.id + " (" + socket.username + ") => " + message);
    }

    
    function logAdmin(message) {
        console.log("#Server => " + message);
    }
})


server.listen(8000, () => console.log("server is running on port 8000"));
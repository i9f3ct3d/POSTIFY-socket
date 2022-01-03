require("dotenv").config();
var app = require('express')();
var http = require('http').createServer(app);



const PORT = process.env.PORT||8900;

const io=require('socket.io')(http,{
    cors:{
        origin:process.env.REACT_APP_URL,
    }
});

let users = [];

const addUsersWithSocketId=(userId , socketId)=>{

    !users.some((user) => user.userId === userId) && users.push({ userId, socketId });

}


const removeUser = ( disconnectedSocketId) =>{
    users = users.filter((user)=> user.socketId !== disconnectedSocketId)
}

const getUser =(userId)=>{

    return users.find((user) => user.userId === userId);
}

const getUserBySocketId =(socketId)=>{

    return users.find((user) => user.socketId === socketId);
}

io.on("connection", (socket) => {
    console.log("user connected to socket");
    io.emit("welcome" , "this is socket");

    socket.on("addUser" , myUserid=>{

        addUsersWithSocketId(myUserid , socket.id);
        io.to(socket.id).emit('getAllOnlineUsers' , users);
        socket.broadcast.emit("getRecentOnlineUser" , {userId : myUserid , socketId : socket.id});
        
    })

    socket.on("sendMessage" , (data)=>{

        const user = getUser(data.recieverId);
        io.to(user.socketId).emit("getMessage" ,{
            recieverId : data.recieverId,
            senderId : data.senderId,
            chatContent : data.chatContent,
            conversationId : data.conversationId,
            customChatid : data.customChatid,
            isSeen : data.isSeen,
            date : new Date()
        })

    })
    
    socket.on("disconnect" , ()=>{
        console.log("User disconnected");
        io.emit("recentOfflineUser" , getUserBySocketId(socket.id));
        removeUser(socket.id);
    });
    
})

http.listen(PORT,()=>{
    console.log(`listening to ${PORT}`);
})
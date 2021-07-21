require("dotenv").config();

const io=require('socket.io')(8900,{
    cors:{
        origin:process.env.REACT_APP_URL,
    }
});

let users = [];

const addUsersWithSocketId=(userId , socketId)=>{

    // !users.some((user) => user.userId === userId) &&
    // users.push({ userId, socketId });

    let flag  = true;

    users.forEach(user => {
        
        if(user.userId === userId){
            flag = false;
        }

    });

    flag && users.push({userId , socketId});

}


const removeUser = ( disconnectedSocketId) =>{
    users = users.filter((user)=> user.socketId !== disconnectedSocketId)
}

const getUser =(userId)=>{

    return users.find((user) => user.userId === userId);
}

io.on("connection", (socket) => {
    console.log("user connected to socket");
    io.emit("welcome" , "this is socket bitch");

    socket.on("addUser" , myUserid=>{

        addUsersWithSocketId(myUserid , socket.id);
        io.emit("getOnlineUsers" , users);
        
    })

    socket.on("sendMessage" , (data)=>{

        io.to(getUser(data.recieverId).socketId).emit("getMessage" ,{
            recieverId : data.recieverId,
            senderId : data.senderId,
            chatContent : data.chatContent,
            conversationId : data.conversationId,
        })

    })
    
    socket.on("disconnect" , ()=>{
        console.log("User disconnected");
        removeUser(socket.id);
        io.emit("getOnlineUsers" , users);
    });
    
})
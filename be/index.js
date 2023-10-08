const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 5000;

const users = {};

app.get("/", (req, res) => {
  res.send("Running");
});

io.on("connection", (socket) => {
	socket.on('subscribe', ({ id }) => {
		users[id] = socket.id;
	});
	
  socket.on("disconnect", ({ id }) => {
    users[id] = undefined;
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(users[userToCall]).emit(`callUser`, { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
		console.log(data.to);
    io.to(users[data.to]).emit("callAccepted", data.signal);
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

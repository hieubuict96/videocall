const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});

io.on("connection", (socket) => {
	console.log('connection', socket);
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		console.log(1);
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		console.log(2);
		console.log(userToCall);
		io.to(userToCall).emit(`callUser/${userToCall}`, { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		console.log(3);
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

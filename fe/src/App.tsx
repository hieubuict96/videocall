import { useEffect, useState } from "react";
import "./App.scss";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:5000");

function App() {
  const [id, setId] = useState<string>("");
  const [idSend, setIdSend] = useState<string>("");
  const [stream, setStream] = useState<any>();
  const [call, setCall] = useState({
    from: null,
    signal: "",
    isReceivingCall: false,
    name: null,
  });

  const subscribePath = () => {
    console.log(`callUser/${id}`);
    socket.on(`callUser/${id}`, ({ from, name: callerName, signal }) => {
      console.log(1);
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  };

  const callUser = () => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: idSend,
        signalData: data,
        from: "",
        name: "",
      });
    });

    peer.on("stream", (currentStream) => {
      console.log(currentStream);
    });

    socket.on("callAccepted", (signal) => {
      peer.signal(signal);
    });
  };

  const answerCall = () => {
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      console.log(currentStream);
    });

    peer.signal(call.signal);
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
      });
  }, []);

  return (
    <div className="App">
      <input value={id} onChange={(e) => setId(e.target.value)} />
      <input value={idSend} onChange={(e) => setIdSend(e.target.value)} />
      <button onClick={subscribePath}>Subscribe Path</button>
      <button onClick={callUser}>Call User</button>
      <button onClick={answerCall}>Answer Call</button>
    </div>
  );
}

export default App;

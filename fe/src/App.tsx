import { useEffect, useRef, useState } from "react";
import "./App.scss";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://192.168.0.104:5000");

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

  const myVideo = useRef<any>();
  const userVideo = useRef<any>();
  const connectionRef = useRef<any>();

  const subscribePath = () => {
    socket.emit('subscribe', {
      id
    });

    socket.on(`callUser`, ({ from, name: callerName, signal }) => {
      console.log('callUser');
      console.log(signal);
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  };

  const callUser = () => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      console.log('peer signal');
      socket.emit("callUser", {
        userToCall: idSend,
        signalData: data,
        from: "",
        name: "",
      });
    });

    peer.on("stream", (currentStream) => {
      console.log('peer stream');
      userVideo.current.srcObject = currentStream;
    });

    socket.on("callAccepted", (signal) => {
      console.log('callAccepted');
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      console.log('peer signal');
      socket.emit("answerCall", { signal: data, to: idSend });
    });

    peer.on("stream", (currentStream) => {
      console.log('peer stream');
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((currentStream) => {
        console.log('media');
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });
  }, []);

  return (
    <div className="App">
      <input value={id} onChange={(e) => setId(e.target.value)} />
      <input value={idSend} onChange={(e) => setIdSend(e.target.value)} />
      <button onClick={subscribePath}>Subscribe Path</button>
      <button onClick={callUser}>Call User</button>
      <button onClick={answerCall}>Answer Call</button>

      <div>
        <video playsInline muted ref={myVideo} autoPlay />
        <video playsInline ref={userVideo} autoPlay />
      </div>
    </div>
  );
}

export default App;

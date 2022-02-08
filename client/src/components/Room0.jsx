import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import styled from 'styled-components';

const StyledVideo = styled.video`
	height: 150px;
	width: 200px;
`;

const Video = (props) => {
	const ref = useRef();

	useEffect(() => {
		props.peer.on('stream', (stream) => {
			ref.current.srcObject = stream;
		});
	}, []);

	return <StyledVideo playsInline autoPlay ref={ref} />;
};

const Room0 = (props) => {
	const [peers, setPeers] = useState([]);
	const [audio, setAudio] = useState(false);
	const [video, setVideo] = useState(true);
	const socketRef = useRef();
	const userVideo = useRef();
	const peersRef = useRef([]);
	const roomID = props.match.params.roomID;

	useEffect(() => {
		socketRef.current = io.connect('http://localhost:80');
		navigator.mediaDevices.getUserMedia({ video: video, audio: audio }).then((stream) => {
			userVideo.current.srcObject = stream;
			socketRef.current.emit('join room', roomID);
			socketRef.current.on('all users', (users) => {
				const peers = [];
				users.forEach((userID) => {
					const peer = createPeer(userID, socketRef.current.id, stream);
					peersRef.current.push({
						peerID: userID,
						peer,
					});
					peers.push(peer);
				});
				setPeers(peers);
			});

			socketRef.current.on('user joined', (payload) => {
				const peer = addPeer(payload.signal, payload.callerID, stream);
				peersRef.current.push({
					peerID: payload.callerID,
					peer,
				});

				setPeers((users) => [...users, peer]);
			});

			socketRef.current.on('receiving returned signal', (payload) => {
				const item = peersRef.current.find((p) => p.peerID === payload.id);
				item.peer.signal(payload.signal);
			});
		});
	}, []);

	function createPeer(userToSignal, callerID, stream) {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream,
		});

		peer.on('signal', (signal) => {
			socketRef.current.emit('sending signal', { userToSignal, callerID, signal });
		});

		return peer;
	}

	function addPeer(incomingSignal, callerID, stream) {
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream,
		});

		peer.on('signal', (signal) => {
			socketRef.current.emit('returning signal', { signal, callerID });
		});

		peer.signal(incomingSignal);

		return peer;
	}

	return (
		<div>

				{/* <StyledVideo ref={userVideo} autoPlay playsInline /> */}
				{peers.map((peer, index) => {
					return (
						<div>
							<Video key={index} peer={peer} />
						</div>
					);
				})}
			<div>
				<button onClick={() => setAudio(!audio)}>{audio ? 'unmute' : 'mute'}</button>
			</div>
			<div>
				<button onClick={() => setVideo(!video)}>{video ? 'stop video' : 'start video'}</button>
			</div>
		</div>
	);
};

export default Room0;

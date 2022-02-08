import React, { useState, useRef, useEffect }from 'react';
import { Box, Select, Button, Heading, Textarea, Flex, Spacer, Center, VStack, HStack, Grid, GridItem } from '@chakra-ui/react';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import Peer from 'simple-peer'
import io from 'socket.io-client';
import styled from 'styled-components';
import socket from 'socket.io-client/lib/socket';

const StyledVideo = styled.video`
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

const Room = (props) => {
	const [peers, setPeers] = useState([]);
	const [audio, setAudio] = useState(false);
	const [video, setVideo] = useState(true);
	const socketRef = useRef();
	const userVideo = useRef();
	const peersRef = useRef([]);
	const roomID = props.match.params.roomID;

	const [code, setCode] = useState(localStorage.getItem('code') || '');
	const [languageID, setLanguageID]=useState(localStorage.getItem('languageID')|| 2);
	const [userInput, setUserInput] = useState('');
		
	const codeHandler = (e) => {
	  e.preventDefault();
	  setCode(e.target.value);
	  socket.emit('code sync', e.target.value);
	  socket.on('code sync', function(data){
		e.target.value = data;
		setCode(e.target.value);
	});
	  localStorage.setItem('code', e.target.value);
	  
	};
	

	const userInputHandler = (e) => {
	  e.preventDefault();
	  setUserInput(e.target.value);
	  }
	const languageIDHandler = (e) => {
	  e.preventDefault();
	  setLanguageID(e.target.value);
	  localStorage.setItem('languageID', e.target.value);
	}
  
	const submitHandler = async (e) => {
	  e.preventDefault();
	  let outputText = document.getElementById("output");
	  outputText.innerHTML = "";
	  outputText.innerHTML += "Creating Submission ...\n";
	  const response = await fetch(
		"https://judge0-ce.p.rapidapi.com/submissions",
		{
		  method: "POST",
		  headers: {
			"x-rapidapi-host": "judge0-ce.p.rapidapi.com",
			"x-rapidapi-key": "API_KEY", // Get yours for free at https://rapidapi.com/judge0-official/api/judge0-ce/
			"content-type": "application/json",
			accept: "application/json",
		  },
		  body: JSON.stringify({
			source_code: code,
			stdin: userInput,
			language_id: languageID,
		  }),
		}
	  );
	  outputText.innerHTML += "Submission Created ...\n";
	  const jsonResponse = await response.json();
  
	  let jsonGetSolution = {
		status: { description: "Queue" },
		stderr: null,
		compile_output: null,
	  };
  
	  while (
		jsonGetSolution.status.description !== "Accepted" &&
		jsonGetSolution.stderr == null &&
		jsonGetSolution.compile_output == null
	  ) {
		outputText.innerHTML = `Creating Submission ... \nSubmission Created ...\nChecking Submission Status\nstatus : ${jsonGetSolution.status.description}`;
		if (jsonResponse.token) {
		  let url = `https://judge0-ce.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true`;
  
		  const getSolution = await fetch(url, {
			method: "GET",
			headers: {
			  "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
			  "x-rapidapi-key": "API_KEY", // Get yours for free at https://rapidapi.com/judge0-official/api/judge0-ce/
			  "content-type": "application/json",
			},
		  });
  
		  jsonGetSolution = await getSolution.json();
		}
	  }
	  if (jsonGetSolution.stdout) {
		const output = atob(jsonGetSolution.stdout);
  
		outputText.innerHTML = "";
  
		outputText.innerHTML += `Results :\n${output}\nExecution Time : ${jsonGetSolution.time} Secs\nMemory used : ${jsonGetSolution.memory} bytes`;
	  } else if (jsonGetSolution.stderr) {
		const error = atob(jsonGetSolution.stderr);
  
		outputText.innerHTML = "";
  
		outputText.innerHTML += `\n Error :${error}`;
	  } else {
		const compilation_error = atob(jsonGetSolution.compile_output);
  
		outputText.innerHTML = "";
 
		outputText.innerHTML += `\n Error :${compilation_error}`;
	  }
	};
   

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
    <>
    <HStack w='full' h='full' align={'flex-start'}>
    <VStack w='80%'
      spacing={3}
      align='stretch'>
        <Flex color='black' bg='gray.300'>
        <Center><Heading size='lg' color='orange.500'>Meet N Code</Heading></Center>
        <Spacer />
        <Select value={languageID} onChange={languageIDHandler} id="tags" placeholder='Select Language' w='xxs' bg='gray.400' mr='1'>
            <option value='54'>C++</option>
            <option value='50'>C</option>
            <option value='62'>Java</option>
            <option value='71'>Python</option>
        </Select>
        <Button type="submit" onClick={submitHandler} bg='green.500' _hover={{ bg: 'green.600' }}>RUN</Button>
        </Flex>

        <Grid h='690px' gap={2} 
                templateRows='repeat(2, 1fr)'
                templateColumns='repeat(3, 1fr)'
            >
            <GridItem rowSpan={2} colSpan={2}>
                <Heading size='md' bg='gray.300'>Code Here </Heading>
                <Textarea id="source" name="solution" onChange={codeHandler} value={code} resize={'none'} h='670px' bg='gray.300' />
            </GridItem>
            <GridItem rowSpan={1}>
                <Heading size='md' bg='#EAEEF2'>Input </Heading>
                <Textarea id="input" onChange={userInputHandler} resize={'none'} h='300px' bg='#EAEEF2'/>
            </GridItem>
            <GridItem rowSpan={1}>
                <Heading size='md' bg='#EAEEF2'>Output </Heading>
                <Textarea id="output" resize={'none'} isDisabled h='340px' bg='gray.300'/>
            </GridItem>
        </Grid>

        <Flex color='black' bg='gray.300'>
            <Center><Heading size='md'>Room ID: { roomID }</Heading></Center>
            <Spacer/>
            {
                audio ? (
                    <Button bg='gray.400' mr='1' onClick={ () => setAudio(false)}> <FaMicrophone/> </Button>
                ) : (
                    <Button  bg='gray.400' mr='1' onClick={ () => setAudio(true)}> <FaMicrophoneSlash/> </Button>
                )
            }

            {
                video ? (
                    <Button bg='gray.400' onClick={ () => { setVideo(false) 

					navigator.mediaDevices.getUserMedia({ video: video, audio: audio }).then((stream) => {
						// const tracks = stream.getVideoTracks();
						// tracks.forEach(track => track.stop());
						userVideo.current.srcObject = null;
						// userVideo.current.srcObject = stream.getVideoTracks()[0].stop()
					})

					}}> <FaVideo /> </Button>
                ) : (
                    <Button  bg='gray.400' onClick={ () => setVideo(true)}> <FaVideoSlash /> </Button>
                )
            }

            <Spacer/>
        </Flex>
    </VStack>
    <VStack w='20%' align={'flex-start'} paddingTop='1px' h='793px' >
        <Box flex='1' bg='gray.300' w='100%' >
        <Heading size='md' align='center' textDecoration='underline' marginBottom={5}>People</Heading>
        <Box>
			<StyledVideo ref={userVideo} autoPlay playsInline />
			{peers.map((peer, index) => {
					return (
						<div>
							<Video key={index} peer={peer} />
						</div>
					);
			})}
        </Box>
        </Box>
    </VStack>
    </HStack>
    </>
      );
  }
export default Room;

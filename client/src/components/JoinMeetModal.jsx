import {useDisclosure, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalFooter, ModalBody, FormControl, FormLabel, Input, Center}from '@chakra-ui/react'
import { useRef } from 'react';
import {FaGoogle} from 'react-icons/fa';
export function JoinMeetModal(props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const username = useRef();
  const roomID = useRef();

const submitHandler = (e)=>{
    e.preventDefault();
    props.history.push(`/room/${roomID.current.value}`);
}
  return (
    <>
      <Button
            onClick={onOpen}
            rounded={'full'} px={6} colorScheme={'orange'}
            bg={'gray.400'}>
            Join Existing Meeting
          </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
        <form onSubmit={ submitHandler }>
          <ModalHeader>Join Existing Meeting</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <FormControl isRequired>
            <FormLabel htmlFor='username'>Username</FormLabel>
            <Input id='username' placeholder='Enter your name' ref={username}/>
            <FormLabel htmlFor='roomID'>Room ID</FormLabel>
            <Input id='roomID' placeholder='Enter room id' ref={roomID}/>
        </FormControl>
          </ModalBody>
          <ModalFooter>
            {/* <Button colorScheme='blue' type='submit' onClick={onClose}>
              Start Meeting
            </Button> */}
            <Button colorScheme='blue' leftIcon={<FaGoogle />}>
              Google
            </Button>
          </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}
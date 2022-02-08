import { useRef } from 'react';
import {v4 as uuid} from 'uuid';
import {useDisclosure, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalFooter, ModalBody, FormControl, FormLabel, Input}from '@chakra-ui/react'

export function StartMeetModal(props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const username = useRef();

const submitHandler = (e)=>{
      e.preventDefault();
      const newid = uuid();
      props.history.push(`/room/${newid}`);
}

  return (
    <>
      <Button
            onClick={onOpen}
            rounded={'full'}
            px={6}
            colorScheme={'orange'}
            bg={'orange.400'}
            _hover={{ bg: 'orange.500' }}>
            Start New Meeting
          </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={submitHandler}>
          <ModalHeader>Start New Meeting</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <FormControl isRequired>
            <FormLabel htmlFor='username'>Username</FormLabel>
            <Input id='username' placeholder='Enter your name' ref={username} />
        </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button type='submit' colorScheme='blue' onClick={onClose}>
              Start Meeting
            </Button>
          </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}
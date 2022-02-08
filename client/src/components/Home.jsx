import { Flex, Container, Heading, Stack, Text, Center } from '@chakra-ui/react';
import { JoinMeetModal } from './JoinMeetModal';
import { StartMeetModal } from './StartMeetModal';

export default function Home(props) {

  return (
    <Container maxW={'5xl'}>
      <Stack
        textAlign={'center'}
        align={'center'}
        spacing={{ base: 4, md: 5 }}
        py={{ base: 4, md: 14 }}>
        <Heading
          fontWeight={600}
          fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
          lineHeight={'110%'}>
          Meet N Code{' '}<br></br>
          <Text as={'span'} color={'orange.400'}>
          Pair Programming for Interviews
          </Text>
        </Heading>
        <Text color={'gray.500'} maxW={'4xl'}>
        Meet N Code lets you conduct hassle-free technical interviews in a real-time shared coding environment.<br></br>
        Communicate effectively with your candidates and your peers with audio and video along with code!<br></br>
        Code editor supports Java , C , C++ and Python!
        </Text>
        <Stack spacing={6} direction={'row'}>
         
         <StartMeetModal history={props.history}/>  
          <JoinMeetModal history={props.history}/>
        </Stack>
        <Flex w={'full'}>
          <Illustration
            height={{ sm: '24rem', lg: '28rem' }}
            mt={{ base: 12, sm: 16 }}
          />
        </Flex>
      </Stack>
      <center>
      <img src="/interview.png" width='80%'
    height='80%' alt="interview"></img></center>
    <Center><Text paddingBottom={5}> Made on the Internet by <a href={'https://github.com/arrayappy'} target="_blank" rel="noopener noreferrer">Appala Naidu Gadu</a> </Text></Center>
    </Container>
  );
}

export const Illustration = () => {
  return (
    <>
    </>
  );
};
import Home from "./components/Home";
import Room from "./components/Room";
import Room0 from "./components/Room0";

import {BrowserRouter , Route, Switch } from 'react-router-dom';

export default function App() {

  return (
    <>
   			<BrowserRouter>
				<Switch>
					<Route path="/" exact component={Home} />
					<Route path="/room/:roomID" component={Room} />
					{/* <Route path="/room0/:roomID" component={Room0} /> */}
					
				</Switch>
			</BrowserRouter> 
    </>
  );
}


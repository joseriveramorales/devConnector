import './App.css';
import {BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

function App() {
  return (
      <Router>
              <Navbar/>
                  <section className="container" >
                      <Routes>
                          <Route exact path = '/' component={Landing} />
                          <Route exact path="/register" component={Register} />
                          <Route exact path="/login" component={Login} />
                  </Routes>
              </section>
      </Router>
  );
}

export default App;

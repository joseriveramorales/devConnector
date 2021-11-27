import './App.css';
import {BrowserRouter, Route, Routes } from "react-router-dom";
import {Fragment} from "react";
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

function App() {
  return (
      <BrowserRouter>
          <Fragment>
          <Navbar/>
              < section className="container">
              <Routes>
                  <Route path = "/" element={<Landing/>} />
                  <Route path="/register" element={<Register/>} />
                  <Route path="/login" element={<Login/>} />
              </Routes>
          </ section>
          </Fragment>
      </BrowserRouter>
  );
}

export default App;

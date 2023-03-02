import React from "react";
import { RiProductHuntLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import heroImg from "../../assets/inv-img.png";
import { ShowOnLogin, ShowOnLogout } from "../../components/protect/HiddenLink";
import Navbar from "../../components/navbar/Navbar";

const Home = () => {
  return (
    <div className="container-fluid">
      <Navbar />
      </div>
  );
};



export default Home;

import React from "react";
import { RiProductHuntLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import heroImg from "../../assets/inv-img.png";
import { ShowOnLogin, ShowOnLogout } from "../../components/protect/HiddenLink";
import Navbar from "../../components/navbar/Navbar";
import Dashboard from "../../components/dashboard/Dashboard";
import Footer from "../../components/footer/Footer";

const Home = () => {
  return (
    <div className="container-fluid">
      <Dashboard />
      <Footer />
    </div>
  );
};



export default Home;

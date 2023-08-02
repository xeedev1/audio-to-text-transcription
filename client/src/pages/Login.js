import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Particles from '../components/Particles';
import LoginForm from '../components/LoginForm';    

const Login = () => {
  return (
    <>
    <Navbar/>
    <Particles />
    <LoginForm/>
    <Footer/>
    </>
  )
}

export default Login
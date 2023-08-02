import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Particles from '../components/Particles';
import FileUpload from '../components/FileUpload';
import FileUploadByUrl from '../components/FileUploadByUrl';

const Home = () => {
  return (
    <>
    <Navbar/>
    <Particles />
    <div className='upload-box'>
    <FileUpload />
    <FileUploadByUrl/>
    </div>
    <Footer/>
    </>
  )
}

export default Home
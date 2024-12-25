import React from 'react';
import './App.css';
import Navbar from './components/NavBar/Navbar';
import APropos from './components/APropos/APropos';
import ChildcareServices from './components/ChildcareServices/ChildcareServices';
import Footer from './components/Footer/Footer';
import BackupService from './components/BackupService/BackupService';

function App() {
  return (
    <div className="App">
      <Navbar />
      <APropos />
      <ChildcareServices />
      <BackupService />
      <Footer />
      <main>
        
        
        
      </main>
    </div>
  );
}

export default App;

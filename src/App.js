import React from 'react';
import './App.css';
import Navbar from './components/NavBar/Navbar';
import APropos from './components/APropos/APropos';

function App() {
  return (
    <div className="App">
      <Navbar />
      <APropos />
      <main>
        
        <h1>Bienvenue sur notre service de garde d'enfants</h1>
        
      </main>
    </div>
  );
}

export default App;

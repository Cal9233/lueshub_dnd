import React from 'react';
import { Routes, Route, useParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import CharacterList from '../../components/CharacterList/CharacterList';
import CharacterForm from '../../components/CharacterForm/CharacterForm';
import PageContainer from '../../components/PageContainer/PageContainer';
import './CharactersPage.css';

const CharactersPage = () => {
  const { user } = useAuth();

  return (
    <div className="app">
      <Navbar 
        username={user?.username}
        activePage="characters"
      />

      <main className="main-content">
        <PageContainer>
          <div className="dashboard-header">
            <h2>Character Management</h2>
            <p>Create and manage your D&D characters</p>
          </div>

          <Routes>
            <Route index element={<CharacterList />} />
            <Route path="new" element={<CharacterForm />} />
            <Route path=":id" element={<CharacterEditWrapper />} />
          </Routes>
        </PageContainer>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 LuesHub D&D. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Wrapper component to pass the character ID to CharacterForm
const CharacterEditWrapper = () => {
  const { id } = useParams();
  return <CharacterForm characterId={id} />;
};

export default CharactersPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS, api } from '../../config/api';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import PageContainer from '../../components/PageContainer/PageContainer';
import CharacterCard from '../../components/CharacterCard/CharacterCard';
import Button from '../../components/Button/Button';
import EmptyState from '../../components/EmptyState/EmptyState';
import Header from '../../components/Headers/Header';
import { FOOTER_LINKS } from '../../utilities/footer-links';
import './Characters.css';

const Characters = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch characters from API
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const data = await api.get(API_ENDPOINTS.CHARACTERS);
      if (data.success) {
        setCharacters(data.characters || []);
      } else {
        console.error('Failed to fetch characters:', data.message);
        setCharacters([]);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };


  const handleViewCharacter = (id) => {
    navigate(`/character/${id}`);
  };

  const handleEditCharacter = (id) => {
    navigate(`/character/${id}/edit`);
  };

  const handleDeleteCharacter = (id) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      // TODO: Delete character via API
      setCharacters(characters.filter(char => char.id !== id));
    }
  };

  const handleCreateCharacter = () => {
    navigate('/character/new');
  };

  return (
    <div className="app">
      <Navbar 
        username={user?.username}
        activePage="characters"
      />
      
      <main className="main-content">
        <PageContainer className="characters-container">
          <div className="page-header">
            <div>
              <Header as="h1" className="page-title">My Characters</Header>
              <p className="welcome-message">
                Manage your heroes and adventurers
              </p>
            </div>
            <Button 
              onClick={handleCreateCharacter}
              className="create-character-btn"
            >
              <i className="fas fa-plus"></i> New Character
            </Button>
          </div>

          {loading ? (
            <div className="loading-container">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading characters...</p>
            </div>
          ) : characters.length > 0 ? (
            <div className="character-grid">
              {characters.map(character => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onView={handleViewCharacter}
                  onEdit={handleEditCharacter}
                  onDelete={handleDeleteCharacter}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="fas fa-user-plus"
              message="No characters yet. Create your first hero!"
              /*actionText="Create Character"
              actionHref="/character/new"*/
            />
          )}
        </PageContainer>
      </main>
      
      <Footer links={FOOTER_LINKS} />
    </div>
  );
};

export default Characters;
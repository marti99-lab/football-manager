import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [selectedLeagueForTeam, setSelectedLeagueForTeam] = useState(1);

  useEffect(() => {
    axios.get('http://localhost:3000/leagues')
      .then(response => {
        setLeagues(response.data);
        setSelectedLeague(response.data[0]);
      });
  }, []);

  const handleLeagueChange = (event) => {
    const league = leagues.find(l => l.name === event.target.value);
    setSelectedLeague(league);
  };

  const handleCreateTeam = () => {
    axios.post('http://localhost:3000/createTeam', {
      name: teamName,
      league: selectedLeagueForTeam,
    }).then(() => {
      // Refresh leagues after adding the new team
      axios.get('http://localhost:3000/leagues')
        .then(response => {
          setLeagues(response.data);
          setSelectedLeague(response.data.find(l => l.name === `Liga ${selectedLeagueForTeam}`));
        });
    });
  };

  return (
    <div className="App">
      <h1>Fußball Manager</h1>
      <div>
        <label htmlFor="league-select">Liga auswählen: </label>
        <select id="league-select" onChange={handleLeagueChange}>
          {leagues.map(league => (
            <option key={league.name} value={league.name}>{league.name}</option>
          ))}
        </select>
      </div>
      
      {selectedLeague && (
        <div>
          <h2>{selectedLeague.name}</h2>
          {selectedLeague.teams.map(team => (
            <div key={team.name} className="team">
              <h3>{team.name}</h3>
              <ul>
                {team.players.map(player => (
                  <li key={`${player.firstName}-${player.lastName}`}>
                    {player.firstName} {player.lastName} - {player.position} - Stärke: {player.strength} - Alter: {player.age} - Vertrag: {player.contractLength} Jahre
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2>Neues Team erstellen</h2>
        <input
          type="text"
          placeholder="Teamname"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        <select onChange={(e) => setSelectedLeagueForTeam(e.target.value)}>
          <option value={1}>1. Liga</option>
          <option value={2}>2. Liga</option>
          <option value={3}>3. Liga</option>
        </select>
        <button onClick={handleCreateTeam}>Team erstellen</button>
      </div>
    </div>
  );
}

export default App;

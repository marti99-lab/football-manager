const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost/football_manager', { useNewUrlParser: true, useUnifiedTopology: true });

const playerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  position: String,
  strength: Number,
  age: Number,
  contractLength: Number,
});

const teamSchema = new mongoose.Schema({
  name: String,
  league: Number,
  players: [playerSchema],
});

const leagueSchema = new mongoose.Schema({
  name: String,
  teams: [teamSchema],
});

const Player = mongoose.model('Player', playerSchema);
const Team = mongoose.model('Team', teamSchema);
const League = mongoose.model('League', leagueSchema);

app.use(cors());
app.use(express.json());

const positions = ['TW', 'VT', 'MIT', 'ST'];
const positionCounts = { 'TW': 2, 'VT': 6, 'MIT': 8, 'ST': 6 };

const generatePlayer = (league) => {
    const firstNames = [
        'Max', 'Paul', 'Lukas', 'Finn', 'Jonas', 'Leon', 'Noah', 'Elias', 'Ben', 'Louis',
        'Felix', 'Liam', 'Henry', 'Julian', 'Matteo', 'David', 'Mats', 'Anton', 'Emil', 'Oskar',
        'Leo', 'Theo', 'Jakob', 'Moritz', 'Nico', 'Philipp', 'Erik', 'Samuel', 'Fabian', 'Simon',
        'Rafael', 'Tom', 'Lenny', 'Alexander', 'Jonathan', 'Jan', 'Hannes', 'Jannik', 'Mika', 'Vincent',
        'Niklas', 'Tobias', 'Carl', 'Sebastian', 'Levi', 'Lennart', 'Robin', 'Julius', 'Finnley', 'Gabriel',
        'Adrian', 'Dominik', 'Marvin', 'Konstantin', 'Michael', 'Tim', 'Joshua', 'Benedikt', 'Frederik', 'Leonard',
        'Aaron', 'Milan', 'Ruben', 'Daniel', 'Maximilian', 'Bastian', 'Andreas', 'Linus', 'Nils', 'Florian',
        'Lars', 'Malte', 'Kilian', 'Jasper', 'Hugo', 'Ludwig', 'Christopher', 'Ferdinand', 'Marlon', 'Samuel',
        'Oliver', 'Lio', 'Kian', 'Janis', 'Emilian', 'Valentin', 'Henryk', 'Fynn', 'Timo', 'Karl',
        'Benno', 'Till', 'Albert', 'Clemens', 'Vinzenz', 'David', 'Jannis', 'Malik', 'Maurice', 'Emanuel'
      ];
      const lastNames = [
        'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
        'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann',
        'Braun', 'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier',
        'Lehmann', 'Schmid', 'Schulze', 'Maier', 'Köhler', 'Herrmann', 'König', 'Walter', 'Mayer', 'Huber',
        'Kaiser', 'Fuchs', 'Peters', 'Lang', 'Scholz', 'Möller', 'Weiß', 'Jung', 'Hahn', 'Schubert',
        'Vogel', 'Friedrich', 'Keller', 'Günther', 'Frank', 'Berger', 'Winkler', 'Roth', 'Beck', 'Lorenz',
        'Baumann', 'Franke', 'Albrecht', 'Schuster', 'Simon', 'Ludwig', 'Böhm', 'Winter', 'Kraus', 'Martin',
        'Schumacher', 'Krämer', 'Vogt', 'Stein', 'Jäger', 'Otto', 'Groß', 'Sommer', 'Seidel', 'Heinrich',
        'Brandt', 'Haas', 'Schreiber', 'Graf', 'Dietrich', 'Ziegler', 'Kuhn', 'Pohl', 'Engel', 'Horn',
        'Busch', 'Bergmann', 'Thomas', 'Voigt', 'Sauer', 'Arnold', 'Wolff', 'Blum', 'Reuter', 'Wolff'
      ];
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const strength = Math.floor(Math.random() * 5) + (league === 1 ? 8 : league === 2 ? 6 : 4);
  const age = Math.floor(Math.random() * 30) + 16;
  const contractLength = Math.floor(Math.random() * 5) + 1;

  return {
    firstName: getRandom(firstNames),
    lastName: getRandom(lastNames),
    position: '',
    strength,
    age,
    contractLength,
  };
};

const generateTeam = (name, league) => {
  const players = [];
  positions.forEach(position => {
    for (let i = 0; i < positionCounts[position]; i++) {
      const player = generatePlayer(league);
      player.position = position;
      players.push(player);
    }
  });

  return new Team({ name, league, players });
};

const createInitialTeams = async () => {
  const leagues = ['1. Liga', '2. Liga', '3. Liga'];
  const teamsPerLeague = 18;

  for (let league = 1; league <= 3; league++) {
    const teams = [];
    for (let i = 0; i < teamsPerLeague; i++) {
      const teamName = `Team ${league}-${i + 1}`;
      teams.push(generateTeam(teamName, league));
    }
    const newLeague = new League({ name: leagues[league - 1], teams });
    await newLeague.save();
  }
};

app.post('/createTeam', async (req, res) => {
  const { name, league } = req.body;
  const leagueData = await League.findOne({ name: `Liga ${league}` });

  if (!leagueData) {
    return res.status(404).send('League not found');
  }

  const newTeam = generateTeam(name, league);
  leagueData.teams[Math.floor(Math.random() * leagueData.teams.length)] = newTeam;
  await leagueData.save();

  res.send('Team created and added to league');
});

app.get('/leagues', async (req, res) => {
  const leagues = await League.find();
  res.send(leagues);
});

// Create initial teams and players on server start
createInitialTeams().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});

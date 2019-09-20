require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const POKEDEX = require('./pokedex.json');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());

app.use(function validateBearerToken(req, res, next) {
  const bearerToken = req.get('Authorization');
  const apiToken = process.env.API_TOKEN;
  if (bearerToken !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next();
});

const validTypes = [
  `Bug`,
  `Dark`,
  `Dragon`,
  `Electric`,
  `Fairy`,
  `Fighting`,
  `Fire`,
  `Flying`,
  `Ghost`,
  `Grass`,
  `Ground`,
  `Ice`,
  `Normal`,
  `Poison`,
  `Psychic`,
  `Rock`,
  `Steel`,
  `Water`
];

function handleGetTypes(req, res) {
  res.json(validTypes);
}

app.get('/types', handleGetTypes);

function handleGetPokemon(req, res) {
  const { name = '', type = '' } = req.query;
  const keys = Object.keys(req.query);
  let response = POKEDEX;

  function filter(key) {
    const value = Object.values(key);
    //console.log(Object.values(keys));
    if (value[0] === 'name' || value[1] === 'name') {
      return false;
    }
    if (value[0] === 'type' || value[1] === 'type') {
      return false;
    } else return true;
  }

  if (keys.length) {
    if (filter(keys)) {
      return res.status(400).send('query must be for name or type');
    }
    if (req.query.name) {
      response = response.pokemon.filter(name => {
        return name.name.toLowerCase().includes(req.query.name.toLowerCase());
      });
    }
    if (req.query.type) {
      response = response.pokemon.filter(type => {
        return type.type.includes(req.query.type);
      });
    }
  }
  res.send(response);
}

app.get('/pokemon', handleGetPokemon);

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {});

const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const util = require('util');

const app = express();

app.use(express.json());

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening to port 3000');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/index.html'))
});

app.post('/', (req, res) => {
  if (req.body) {
    console.log(req.body);
    res.end(JSON.stringify(req.body));
  } else {
    res.end('Homepage with "POST" and no payload')
  }
});

app.get('/hooks', (req, res) => {
  res.end('Hooks page with "GET"');
})

app.post('/hooks', (req, res) => {
  if (req.body) {
    console.log(req.body);
    res.end(JSON.stringify(req.body));
  } else {
    res.end('Hooks page with "POST" and no payload');
  }
})

app.get('/access', (req, res) => {
  const client = '41e60573e31f48af0084';
  const secret = 'f3e5ec6ea357c57c4d0c1a9cb875c109ebbcc49a';
  const redirect = 'https://testing-heroku-mut.herokuapp.com/access';
  const { code } = req.query;
  // return res.end(`https://github.com/login/oauth/access_token?client_id=${client}&client_secret=${secret}&code=${code}`)
  // console.log(code);
  // console.log(`https://github.com/login/oauth/access_token?client_id=${client}&client_secret=${secret}&code=${code}`);
  fetch(`https://github.com/login/oauth/access_token?client_id=${client}&client_secret=${secret}&code=${code}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(token => {
      if (typeof token === 'object') {
        res.end(JSON.stringify())
      } else {
        res.end(token)
      }
      // console.log(typeof token);
      // console.log(token);
      // console.log(util.inspect(token, { showHidden: true, depth: null }));
      // return token
    })
    // .then(token => res.json(token))
    .catch(console.error);
})

app.get('/finish', (req, res) => {
  res.end(JSON.stringify(req.query));
})

app.get('/github-logo.png', (req, res) => {
  res.sendFile(path.join(__dirname+'/github-logo.png'))
})

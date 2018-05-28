const express = require("express");

const app = express();

app.use(express.json());

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening to port 3000');
});

app.get('/', (req, res) => {
  res.end('Homepage with "GET"')
});

app.post('/', (req, res) => {
  if (req.body) {
    console.log(req.body);
    res.end(req.body);
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
    res.end(req.body);
  } else {
    res.end('Hooks page with "POST" and no payload');
  }
})

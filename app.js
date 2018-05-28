const express = require("express");

const app = express();

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening to port 3000');
});

app.get('/', (req, res) => {
  if (req.payload) {
    console.log(req.payload);
    res.end(req.payload);
  } else {
    res.end('Homepage with no payload')
  }
});

app.get('/hooks', (req, res) => {
  if (req.payload) {
    console.log(req.payload);
    res.end(req.payload);
  } else {
    res.end('Hooks page with no payload');
  }
})

app.post('/hooks', (req, res) => {
  if (req.payload) {
    console.log(req.payload);
    res.end(req.payload);
  } else {
    res.end('Hooks page with no payload');
  }
})

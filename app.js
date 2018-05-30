const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const util = require('util');
const fs = require('fs');

const { request, GraphQLClient } =  require('graphql-request');

const app = express();
const API_URL = 'https://api.github.com/graphql';

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
})

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
  const client = process.env.CLIENT;
  const secret = process.env.SECRET;
  const redirect = 'http://localhost:3000/access';
  const { code } = req.query;

  fetch(`https://github.com/login/oauth/access_token?client_id=${client}&client_secret=${secret}&code=${code}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(token => {
      token.buffer()
        .then(response => {
          console.log(JSON.parse(response.toString()).access_token);
          getRepos(JSON.parse(response.toString()).access_token, res);
        })
        .catch(console.error);
    })
    .catch(console.error);
})

app.get('/loggedin', (req, res) => {
  const client = process.env.CLIENT;
  const secret = process.env.SECRET;
  const token = process.env.TOKEN;

  getRepos(token, res);
})

app.post('/receive', (req, res) => {
  console.log('received ping');

  const client = new GraphQLClient(API_URL, {
    headers: {
      Authorization: `Bearer ${process.env.TOKEN}`,
    },
  })

  const query = `{
    viewer {
      repository(name: "empty-repo-3") {
            id
            name
            object(expression: "master:README.md") {
            id
            ... on Blob {
              text
            }
          }
      }
    }
  }`;

  client.request(query)
    .then(data => {
      const { text } = data.viewer.repository.object;
      fs.writeFile("text.txt", text, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      });
      console.log(text);
    })
    .catch(console.error)
  res.end();
})

app.get('/content', (req, res) => {
  fs.readFile('text.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    res.end(data);
  });
})

app.get('/finish', (req, res) => {
  res.end(JSON.stringify(req.query));
})

app.get('/github-logo.png', (req, res) => {
  res.sendFile(path.join(__dirname+'/github-logo.png'))
})

const getRepos = (accessToken, res) => {
  const client = new GraphQLClient(API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  let output = ``;

  const fetchPages = (code) => {
    const query = `{
      viewer {
        repositories(first: 30${code ? `, after: "${code}"` : '' }, affiliations: OWNER) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              name
              id
            }
          }
        }
      }
    }`;

    client.request(query)
      .then(data => {
        const { edges } = data.viewer.repositories;
        const { hasNextPage } = data.viewer.repositories.pageInfo;
        edges.forEach(edge => output += `${JSON.stringify(edge.node)}\n`);
        if (!hasNextPage) {
          res.end(output);
        } else {
          fetchPages(data.viewer.repositories.pageInfo.endCursor)
        }
      })
      .catch(console.error)
  }

  return fetchPages();
}

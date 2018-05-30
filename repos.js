const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const util = require('util');
const { request, GraphQLClient } =  require('graphql-request');

const app = express();
const API_URL = 'https://api.github.com/graphql';
const token = process.env.TOKEN;

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
  const client = new GraphQLClient(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  let output = '';

  const fetchPages = (code) => {
    const query = `{
      viewer {
        repositories(first: 30${code ? `, after: "${code}"` : '' }) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              name
            }
          }
        }
      }
    }`;

    client.request(query)
      .then(data => {
        const { edges } = data.viewer.repositories;
        const { hasNextPage } = data.viewer.repositories.pageInfo;
        edges.forEach(edge => output += `${edge.node.name}\n`);
        if (!hasNextPage) {
          res.end(output)
        } else {
          fetchPages(data.viewer.repositories.pageInfo.endCursor)
        }
      })
      .catch(console.error)
  }

  fetchPages();
});

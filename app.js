const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'hospitals.json');

// Read data from JSON file
const readData = () => {
  try {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Write data to JSON file
const writeData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Server Setup
const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (url === '/hospitals') {
    if (method === 'GET') {
      // GET all hospitals
      const hospitals = readData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(hospitals));
    } else if (method === 'POST') {
      // POST - Add a new hospital
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        const newHospital = JSON.parse(body);
        const hospitals = readData();
        hospitals.push(newHospital);
        writeData(hospitals);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newHospital));
      });
    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
    }
  } else if (url.startsWith('/hospitals/')) {
    const id = url.split('/')[2];
    const hospitals = readData();
    const index = hospitals.findIndex(h => h.id === id);

    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Hospital Not Found');
      return;
    }

    if (method === 'PUT') {
      // PUT - Update hospital details
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        const updatedHospital = JSON.parse(body);
        hospitals[index] = { ...hospitals[index], ...updatedHospital };
        writeData(hospitals);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(hospitals[index]));
      });
    } else if (method === 'DELETE') {
      // DELETE - Remove a hospital
      hospitals.splice(index, 1);
      writeData(hospitals);
      res.writeHead(204);
      res.end();
    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

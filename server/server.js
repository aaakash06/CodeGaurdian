const pg = require('pg');
const express=require("express");
const app=express();
require("dotenv").config();
const { exec } = require('child_process');

const config = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_USER_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.POSTGRES_CA
  }
};

const client = new pg.Client(config);

client.connect(function (err) {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Database connected successfully');
    
    // Query after successful connection
    client.query("SELECT VERSION()", [], function (err, result) {
      if (err) {
        console.error('Error running query', err.stack);
      } else {
        console.log('PostgreSQL Version:', result.rows[0].version);
        
        // Close connection after query is done
        // client.end(function (err) {
        //   if (err) {
        //     console.error('Error closing connection', err.stack);
        //   } else {
        //     console.log('Connection closed');
        //   }
        // });
      }
    });
  }
});

app.get('/api/fetch-commits', (req, res) => {
  exec('python ../script/setup.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error}`);
      return res.status(500).json({message:'Error fetching commits'});
    }
    if (stderr) {
      console.error(`Python script stderr: ${stderr}`);
      return res.status(500).json({message:"Script failed"})
    }
    console.log(`Python script output: ${stdout}`);
    return res.status(201).json({message:'Commits fetched successfully'});
  });
});

app.get('/api/commits', async (req, res) => {
    try {
      const result = await client.query('SELECT * FROM commits ORDER BY date DESC');
      res.status(200).json({commits:result.rows});
    } catch (error) {
      console.error('Error fetching commits:', error);
      res.status(500).json({ error: 'Internal Server Error',message:"Failed to fetch the commits" });
    }
  });
  
  app.delete('/api/truncate-commits', async (req, res) => {
    try {
      await client.query('TRUNCATE TABLE commits RESTART IDENTITY');
      return res.status(200).json({message:'Commits table truncated successfully'});
    } catch (error) {
      console.error('Error truncating commits table:', error);
     return  res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  const port = process.env.PORT || 5000;
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
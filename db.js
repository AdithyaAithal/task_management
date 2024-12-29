const mysql = require('mysql');

// Create a connection pool to the MySQL database
const db = mysql.createPool({
 host: 'sql12.freesqldatabase.com', // MySQL host (use your database server's address if not local)
  user: 'sql12754654', // MySQL username
  password: 'pRppCQ4PDB', // MySQL password
  database: 'sql12754654', // Name of your database
  port: '3306',
  connectionLimit: 10, // Limit the number of simultaneous connections
});

// Function to execute queries on the database
db.queryAsync = function(query, values) {
  return new Promise((resolve, reject) => {
    db.query(query, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = db;

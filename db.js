const mysql = require('mysql');

// Create a connection pool to the MySQL database
const db = mysql.createPool({
  host: 'localhost', // MySQL host (use your database server's address if not local)
  user: 'root', // MySQL username
  password: '', // MySQL password
  database: 'task_management', // Name of your database
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

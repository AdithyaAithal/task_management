const express = require('express');
const db = require('./db'); // Assuming this is your database connection module
const session = require('express-session');
const app = express();
const path = require('path')
const port = 3000
app.use(express.json());  // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data

// Set up the session middleware
app.use(session({
  secret: 'your_secret_key',  // Replace with a secure key
  resave: false,
  saveUninitialized: true
}));

// app.use(express.static('public')); //very important line 
app.use(express.static(path.join(__dirname, 'public'))); // Serve files from 'public' directory;

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate user credentials (example logic)
  const validateUserQuery = 'SELECT role,employee_id FROM tasks WHERE username = ? AND password = ?';
  db.query(validateUserQuery, [username, password], (err, results) => {
      if (err) {
          console.error('Error validating user:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length > 0) {
          const role = results[0].role;
          const eid = results[0].employee_id;

          // Save user session and send role info in response
          req.session.role = role;
          req.session.eid = eid;
          res.json({ role,eid }); // Return the role as JSON
      } else {
          res.status(401).json({ message: 'Invalid username or password' });
      }
  });
});



app.get('/admin_dashboard', (req, res) => {
  const { role } = req.session;

  if (role !== 1) { // Ensure only admin has access
      return res.status(403).json({ message: 'Unauthorized access' });
  }

  const fetchTasksQuery = 'SELECT task_id, employee_id, task_description, priority, created_at, status, complexity FROM tasks';
  db.query(fetchTasksQuery, (err, results) => {
      if (err) {
          console.error('Error fetching tasks:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
      }

      res.json(results); // Send tasks data as JSON
  });
});




// // Route to fetch tasks
// app.get('/admin_dashboard', async (req, res) => {
//   try {
//       // Query to fetch tasks
//       const [tasks] = db.query('SELECT * FROM tasks');
      
//       if (tasks.length === 0) {
//           return res.status(200).json([]); // No tasks found
//       }

//       res.status(200).json(tasks); // Send tasks data as JSON
//   } catch (error) {
//       console.error("Error fetching tasks:", error);
//       res.status(500).json({ error: "Failed to fetch tasks" });
//   }
// });

// Route to add a new task
app.post('/add_task', async (req, res) => {
  try {
      const { task_id, task_description, priority, employee_id, created_at, status, complexity } = req.body;

      // // Input validation
      // if (!task_id || !task_description || !priority || !employee_id) {
      //     return res.status(400).json({ error: "All fields are required" });
      // }

      // Insert task into database
      const query = `
          INSERT INTO tasks (task_id, task_description, priority, employee_id, created_at, status, complexity)
          VALUES (?, ?, ?, ?, NOW(), 'Pending', ?)
      `;
       db.query(query, [task_id, task_description, priority, employee_id, created_at, status, complexity]);

      res.status(201).json({ message: "Task added successfully" });
  } catch (error) {
      console.error("Error adding task:", error);
      res.status(500).json({ error: "Failed to add task" });
  }
});


app.get('/employee_dashboard', (req, res) => {
  const { role , eid  } = req.session;

  // Check if the user is logged in and is an employee (role 2)
  if (role !== 0) {
      return res.status(403).json({ message: 'Unauthorized access' });
  }

  // Fetch tasks assigned to the employee (assuming `userId` is the employee ID)
  const fetchTasksQuery = `
      SELECT task_id, task_description, priority, created_at, status, complexity
      FROM tasks
      WHERE employee_id = ?`;  // Assuming employee_id links tasks to the employee

  db.query(fetchTasksQuery, [eid], (err, results) => {
      if (err) {
          console.error('Error fetching tasks:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
      }

      // Return the tasks data as JSON
      res.json(results);
  });
});

app.put('/update_task/:task_id', (req, res) => {
  const taskId = req.params.task_id;
  const { priority, status, complexity } = req.body;

  // Ensure all required data is provided
  if (!priority || !status || !complexity) {
    return res.status(400).json({ error: 'Missing task details' });
  }

  // Update the task in the database
  db.query(
    'UPDATE tasks SET priority = ?, status = ?, complexity = ? WHERE task_id = ?',
    [priority, status, complexity, taskId],
    (error, results) => {
      if (error) {
        console.error('Error updating task:', error);
        return res.status(500).json({ error: 'Failed to update task' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ success: true, message: 'Task updated successfully' });
    }
  );
});


// Logout route to destroy session
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');  // Redirect to login page after logout
  });
});

app.listen(port, () => {
  console.log('Server is running on port 3000');
});

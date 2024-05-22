const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./db"); // Import the User model
const MY_SECRET_KEY = "my_secret_key"; // Change this to your own secret key
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// Routes

// Registration Route
app.post("/registeration", async (req, res) => {
  try {
    const { name, email, password, PhoneNo } = req.body;

    // Check if email already exists
    const existing_User = await User.findOne({ email });
    if (existing_User) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashed_Password = await bcrypt.hash(password, 10);

    // Create a new user
    const new_User = new User({
      name,
      email,
      password: hashed_Password,
      PhoneNo,
    });

    // Save the user to the database
    await new_User.save();

    res.status(201).json({ message: "User registered Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "server error occured" });
    } 

    // Check if password is correct
    const password_Match = await bcrypt.compare(password, user.password);
    if (!password_Match) {
      return res.status(401).json({ message: "Error in  Credentials occured" });
    }

    // Generate JWT token
    const tokenGen = jwt.sign({ id: user._id, email: user.email },MY_SECRET_KEY, {
      expiresIn: "10m",
    });

    res.cookie("token", tokenGen, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600000,
    });

    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create Todo Route
app.post("/saveTasks", verifyuser, async (req, res) => {
  try {
    const { todoText } = req.body;

    // Extract user ID from token
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add todo to user's tasks array
    const newTodo = { todo: todoText };
    user.tasks.push(newTodo);
    await user.save();
    console.log(newTodo);

    res.status(201).json(newTodo.todo); // Return the newly created todo
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Read Todos Route
app.get("/tasks", verifyuser, async (req, res) => {
  try {
    // Extract user ID from token
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "invalid user" });
    }

    // Extract todos from user's tasks array
    const todos = user.tasks.map((task) => ({
      id: task._id, // Assuming the todo id is stored in the _id field of the task object
      text: task.todo,
    }));

    // Return array of todos
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error occurred" });
  }
});

// Delete Todo Route
app.delete("/deleteTasks", verifyuser, async (req, res) => {
  try {
    const { todoId } = req.body;

    // Extract user ID from token
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: " invalid user" });
    }

    // Find the index of the todo with the given ID
    const task_Index = user.tasks.findIndex((task) => {
      return task._id.toString() === todoId;
    });

    // If the todo with the given ID doesn't exist, return 404
    if (task_Index === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Remove the todo from the user's tasks array
    user.tasks.splice(task_Index, 1);

    // Save the updated user object
    await user.save();

    // Return success response
    res.json({ message: "Task deleted " });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
});

// Update Todo Route
app.put("/updateTasks", verifyuser, async (req, res) => {
  try {
    const { todoId, newText } = req.body;

    // Extract user ID from token
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not registered" });
    }

    // Find the index of the todo with the given ID
    const task_Index = user.tasks.findIndex(
      (task) => task._id.toString() === todoId
    );

    // If the todo with the given ID doesn't exist, return 404
    if (task_Index === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the todo text
    user.tasks[task_Index].todo = newText;

    // Save the updated user object
    await user.save();

    // Return the updated todo
    // res.json(user.tasks[todoIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
});

//middleware JWT
function verifyuser(req, res, next) {
  const token = req.cookies.token; // Read token from HttpOnly cookie
  console.log(token);

  if (!token) {
    res.status(401).json({ message: "No token provided" });
  } else {
    jwt.verify(token, MY_SECRET_KEY, (err, user) => {
      if (err) {
        res.status(403).json({ message: "Token is not valid" });
      } else {
        req.user = user;
        next();
      }
    });
  }
}

// Protected route
app.get("/secured", verifyuser, (req, res) => {
  res.json({ message: "Protected resource accessed" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

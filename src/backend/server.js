const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./db"); // Import the User model
const SECRET_KEY = "your_secret_key"; // Change this to your own secret key
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://664dec9de70cb804c19c217d--gregarious-wisp-f89569.netlify.app"
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// Routes

app.get("/test", async (req, res) => {
  try {
    res.status(200).json({ message: "API is working correctly" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Registration Route
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, PhoneNo } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      PhoneNo,
    });

    // Save the user to the database
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
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
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: "10m",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600000,
    });

    res.json({ success: true, message: "Login successful" , token: token});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create Todo Route
app.post("/saveTodo", verifyToken, async (req, res) => {
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
app.get("/todos", verifyToken, async (req, res) => {
  try {
    // Extract user ID from token
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete Todo Route
app.delete("/deleteTodo", verifyToken, async (req, res) => {
  try {
    const { todoId } = req.body;

    // Extract user ID from token
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the todo with the given ID
    const todoIndex = user.tasks.findIndex((task) => {
      return task._id.toString() === todoId;
    });

    // If the todo with the given ID doesn't exist, return 404
    if (todoIndex === -1) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Remove the todo from the user's tasks array
    user.tasks.splice(todoIndex, 1);

    // Save the updated user object
    await user.save();

    // Return success response
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update Todo Route
app.put("/updateTodo", verifyToken, async (req, res) => {
  try {
    const { todoId, newText } = req.body;

    // Extract user ID from token
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the todo with the given ID
    const todoIndex = user.tasks.findIndex(
      (task) => task._id.toString() === todoId
    );

    // If the todo with the given ID doesn't exist, return 404
    if (todoIndex === -1) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Update the todo text
    user.tasks[todoIndex].todo = newText;

    // Save the updated user object
    await user.save();

    // Return the updated todo
    // res.json(user.tasks[todoIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//middleware JWT
function verifyToken(req, res, next) {
  const token = req.cookies.token; // Read token from HttpOnly cookie
  console.log(token);

  if (!token) {
    res.status(401).json({ message: "No token provided" });
  } else {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        res.status(403).json({ message: "Token is invalid" });
      } else {
        req.user = decoded;
        next();
      }
    });
  }
}

// Protected route
app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected resource accessed successfully" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

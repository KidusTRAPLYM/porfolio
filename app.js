// modules
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const app = express();
const PORT = process.env.PORT || 4000;
const Contact = require("./models/Contact");
require("dotenv").config();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.render("website");
});

app.get("/admin", async (req, res) => {
  if (req.session && req.session.isAdmin) {
    // Authenticated: show contacts
    try {
      const contacts = await Contact.find().sort({ date: -1 });
      res.render("admin", { contacts, showLogin: false });
    } catch (err) {
      res.status(500).send("Error loading contacts.");
    }
  } else {
    // Not authenticated: show login form
    res.render("admin", { contacts: [], showLogin: true });
  }
});

app.post("/admin", async (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    const contacts = await Contact.find().sort({ date: -1 });
    res.render("admin", { contacts, showLogin: false });
  } else {
    res.render("admin", {
      contacts: [],
      showLogin: true,
      error: "Incorrect password.",
    });
  }
});

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB (portfolio database)");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
})();

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await Contact.create({ name, email, message });
    res.render("success"); // Render success page
  } catch (err) {
    res.render("error"); // Render error page
  }
});

// Admin login page
app.get("/admin-login", (req, res) => {
  res.render("admin-login");
});

// Admin POST route for authentication

app.get("/architecture", (req, res) => {
  res.render("architecture");
});

app.get("/books", (req, res) => {
  res.render("books");
});
app.get("/design", (req, res) => {
  res.render("design");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

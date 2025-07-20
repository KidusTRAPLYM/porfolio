// modules
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const app = express();
const PORT = 4000;
const Contact = require("./models/Contact");

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
  if (password === "betty!@#$%") {
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
    await mongoose.connect(
      "mongodb+srv://traplympr:traply%5Fninja%5F1234@cluster0.dlgfa.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
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

// Admin authentication middleware
function adminAuth(req, res, next) {
  const { password } = req.body;
  if (password === "betty!@#$%") {
    next();
  } else {
    res.render("error", { message: "Unauthorized access." });
  }
}

// Admin POST route for authentication
app.post("/admin", adminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.render("admin", { contacts });
  } catch (err) {
    res.status(500).send("Error loading contacts.");
  }
});

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

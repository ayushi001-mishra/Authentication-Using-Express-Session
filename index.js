const express = require('express');
const session = require('express-session');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname+"/public"));

app.use(session({
  secret: 'nothing',
  resave: false,
  saveUninitialized: true,
}));

let users = [];
if (fs.existsSync('users.json')) {
  const usersData = fs.readFileSync('users.json');
  users = JSON.parse(usersData);
}

app.get("/", function(req, res){
    if(!req.session.isLoggedIn){
        res.redirect("/login");
        return;
    }
    res.sendFile(__dirname+"/public/home.html")
})

app.get("/login", function(req, res){
    res.sendFile(__dirname+"/public/login.html");
})


app.post('/login', (req, res) => {

  const email=req.body.email;
  const password=req.body.password;

  const user = users.find(u => u.email === email);
  if (user && user.password===password) {
    req.session.isLoggedIn = true;
    req.session.loggedInUser = user;
    res.redirect('/');
  } else {
    res.redirect('/login-error');
  }
});

app.post('/create-account', (req, res) => {
  const email=req.body.email;
  const password=req.body.password;

  if (users.some(u => u.email === email)) {
    res.send('An account with this email already exists. Please use a different email.');
  } else {
    const newUser = { email, password };
    users.push(newUser);
    fs.writeFileSync('users.json', JSON.stringify(users));
    res.redirect('/login');
  }
});


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/login-error', (req, res)=>{
    res.send("error");
})
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


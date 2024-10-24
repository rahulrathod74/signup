const http = require("http");
const fs = require("fs");
const qs = require('querystring')

const renderSignupPage = (res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(`
        <html>
            <head><title>Signup Form</title></head>
            <body>
                <h1>Sign Up</h1>
                <form method="POST" action="/signup">
                    <label>Username: </label><input type="text" name="username" required /><br>
                    <label>Password: </label><input type="password" name="password" required /><br>
                    <button type="submit">Signup</button>
                </form>
            </body>
        </html>
        `);
  res.end();
};

const handleSignup = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    console.log(`BODY : ${body}`)
    const parsedData = qs.parse(body);
    console.log(`PARSED DATA : ${parsedData}`)
    const { username, password } = parsedData;

    const userData = { username, password };

    fs.appendFile("user.txt", JSON.stringify(userData) + "\n", (err) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(`Error in saving data : ${err.toString()}`);
      } else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Thank you for Signing up !");
      }
    });
  });
};

const displayAllUsers = (res) => {
  fs.readFile("user.txt", "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(`Error in reading data : ${err.toString()}`);
    } else {
        console.log(`DATA : ${data.split('\n').filter((l)=> l).map(l=> JSON.parse(l))}`)
      const users = data  // {"username":"admin","password":"password"}//{"username":"admin2","password":"password2"}
        .split("\n") // [{}, {}]
        .filter((line) => line) // {}, {}
        .map((line) => JSON.parse(line)); //{} => string to JS Object
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write("<h1>All Users</h1><ul>");
      users.forEach((user) => {
        res.write(`<li>${user.username}</li>`);
      });
      res.write("</ul>");
      res.end();
    }
  });
};

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url == "/signup") {
    renderSignupPage(res);
  } else if (req.method === "POST" && req.url === "/signup") {
    handleSignup(req, res);
  } else if (req.method === "GET" && req.url === "/allusers") {
    displayAllUsers(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(3030, () => {
  console.log("Server is running on :  http://localhost:3030");
});

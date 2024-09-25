const express = require('express');
const User = require('./models/tables');
const app = express()
const port = 4000;



// Call the function to insert a user


app.get('/', (req, res) => {
  res.send('Wecome')
})

app.post('/user', (req, res) => {
  const {name, password, email } = req.body;
  async function insertUser(username, password, email) {
    try {
        const user = await User.create({ username, password, email });
        console.log("User inserted successfully:", user.toJSON());
    } catch (error) {
        console.error("Error inserting user:", error);
    }
    }
 insertUser(name, password, email);
})


app.get('/users', async (req, res) => {
    // Find all users
    const users = await User.findAll();
    console.log(users.every(user => user instanceof User)); // true
    console.log('All users:', JSON.stringify(users, null, 2));
    res.send(JSON.stringify(users, null, 2))
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
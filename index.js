const express = require('express');
const User = require('./models/tables');
const app = express()
const port = 4000;

async function insertUser(username, password, email) {
  try {
    const user = await User.create({ username, password, email });
    console.log("User inserted successfully:", user.toJSON());

        // Find all users
    const users = await User.findAll();
    console.log(users.every(user => user instanceof User)); // true
    console.log('All users:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error inserting user:", error);
  }
}

// Call the function to insert a user


app.get('/', (req, res) => {
 insertUser('Ricardos', 'san123tos', 'fondungaasdsasdllah12@gmail.com');
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
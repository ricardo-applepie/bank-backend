const express = require('express');
const { User, Account, Notification, Transaction } = require('./models/tables');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express()
const port = 4000;
const cors = require('cors'); // Import the cors middleware
const { json, Sequelize } = require('sequelize');
const sequelize = require('./sequelize');
const corsOptions = {
  origin: '*', // Allow only this origin
  methods: ['GET', 'POST'],        // Allow specific HTTP methods
  credentials: true                // Allow cookies and credentials if necessary
};

app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

function verifyToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, 'hashed-code-12');
    req.userId = decoded.userId;
    next();
   } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
   }
 };

app.post('/create', async (req, res) => {
  const { senderId, receiverId, amount, type } = req.body;

  // Start a new transaction
  const t = await sequelize.transaction();

  try {
    // Find both sender and receiver accounts
    const senderAccount = await Account.findOne({ where: { userId: senderId } }, { transaction: t });
    const receiverAccount = await Account.findOne({ where: { userId: receiverId } }, { transaction: t });

    if (!senderAccount || !receiverAccount) {
      await t.rollback(); // Rollback if either account not found
      return res.status(404).json({ message: 'Sender or receiver account not found' });
    }

    // Ensure sufficient balance for debit transactions
    if (type === 'debit' && parseFloat(senderAccount.balance) < parseFloat(amount)) {
      await t.rollback();
      return res.status(400).json({ message: 'Insufficient balance in sender account' });
    }

    // Create the transaction
    const transaction = await Transaction.create(
      {
        senderId,
        receiverId,
        amount,
        type,
      },
      { transaction: t }
    );

    // Update the sender's balance (if debit)
    if (type === 'debit') {
      senderAccount.balance = parseFloat(senderAccount.balance) - parseFloat(amount);
      await senderAccount.save({ transaction: t });
    }

    // Update the receiver's balance (if debit or credit)
    receiverAccount.balance = parseFloat(receiverAccount.balance) + parseFloat(amount);
    await receiverAccount.save({ transaction: t });

    // Commit the transaction
    await t.commit();

    // Fetch the updated sender account details
    const account = await Account.findOne({
      where: { userId: senderId },
      include: [{
        model: User,
        attributes: ['firstName', 'lastName', 'email'], // Include user details
      }],
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const accountData = account.toJSON();
    const user = accountData.User;

    // Fetch unread notifications for the sender
    const notifications = await Notification.findAll({
      where: { userId: senderId, status: 'unread' },
      attributes: ['notificationId', 'message', 'status', 'createdAt'], // Specify the fields you want
      order: [['createdAt', 'DESC']], // Order by creation date, latest first
    });

    const plainNotifications = notifications.map(notification => notification.get({ plain: true }));

    // Fetch all users except the sender
    const users = await User.findAll({
      where: {
        userId: {
          [Sequelize.Op.ne]: senderId  // Exclude the sender
        }
      },
      attributes: ['userId', 'firstName', 'lastName', 'email'] // Specify the fields you want to include
    });

    const plainUsers = users.map(user => user.get({ plain: true }));

    // Restructure the response
    const response = {
      userId: senderId, // Assuming senderId corresponds to the user making the request
      accountId: accountData.accountId,
      balance: accountData.balance,
      email: accountData.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: accountData.createdAt,
      updatedAt: accountData.updatedAt,
      notifications: plainNotifications, // Include notifications
      users: plainUsers, // Include users
      transaction // Include the created transaction if needed
    };

    res.status(201).json(response);
  } catch (error) {
    // If any error occurs, rollback the transaction
    await t.rollback();
    res.status(500).json({ message: 'Transaction failed', error: error.message });
  }
});


// Call the function to insert a user

app.post('/login', async (req, res) => {
 try {
   const { username, password } = req.body;
   const user = await User.findOne({ where: { username: username } });
   if (!user.dataValues.userId) {
     return res.status(401).json({ error: 'Authentication failed' });
   }
   const passwordMatch = await bcrypt.compare(password, user.dataValues.password);
   if (!passwordMatch) {
     return res.status(401).json({ error: 'Authentication failed password' });
   }
   const token = jwt.sign({ userId: user.dataValues.userId }, 'hashed-code-12');
   res.status(200).json({ token });

   } catch (error) {
     res.status(500).json({ error: 'Login failed' });
   }
 });

app.get('/account', verifyToken, async (req, res) => {
  try {
    const { userId } = req;
    console.log('Fetching account for userId:', userId);

    const account = await Account.findOne({
      where: { userId: userId },
      include: [{
        model: User,
        attributes: ['firstName', 'lastName', 'email'], // Specify the fields you want to include
      }, 
    ],

    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Fetch notifications for the specific user
    const notifications = await Notification.findAll({
      where: { userId: userId , status : 'unread'},
      attributes: ['notificationId', 'message', 'status', 'createdAt'], // Specify the fields you want
      order: [['createdAt', 'DESC']], // Order by creation date, latest first
    });

    const transactions = await Transaction.findAll({
    where: {
        [Sequelize.Op.or]: [
        { senderId: userId },
        { receiverId: userId }
        ]
    },
    order: [['createdAt', 'DESC']], // Order by creation date, latest first
    });

    const users = await User.findAll({
        where: {
            userId: {
            [Sequelize.Op.ne]: userId  // Exclude the current user
            }
        }
    });
    const plainNotifications = notifications.map(notification => notification.get({ plain: true }));


    // Restructure the response
    const accountData = account.toJSON();
    const user = accountData.User;

    // Flatten the user fields into accountData
    const response = {
      userId: userId,   
      accountId: accountData.accountId,
      balance: accountData.balance,
      email: accountData.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: accountData.createdAt,
      updatedAt: accountData.updatedAt,
      notifications: plainNotifications, 
      users: users, 
      transactions: transactions
    };

    res.status(200).json(response);
   } catch (error) {
    console.error('Error fetching account and user details:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});


app.post('/user',  (req, res) => {
  const {firstName, lastName, password, email, username } = req.body;
  let saltRounds = 10;
    bcrypt.hash(password, saltRounds, async function(err, hash) {
        try {
            const user = await User.create({firstName, lastName, username, password: hash, email, username });
             const createdUserID =  user.toJSON().userId;
            await Account.create({
                balance: 0, // Random balance for example
                email: email, // Use the same email for the account
                userId: createdUserID // Associate the account with the created user
            });
            res.json({user: user.id})
        } catch (error) {
            
            console.error("Error inserting user:", error);
        }    
   });


})


app.get('/users', verifyToken, async (req, res) => {
    // Find all users
    const users = await User.findAll();
    console.log('All users:', JSON.stringify(users, null, 2));
    res.status(200).json({users});
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
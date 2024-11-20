// models/tables.js
const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Ensure the path is correct

// Define the User model
const User = sequelize.define('User', {
  userId: {
    type: DataTypes.UUID,            // Use UUID data type
    defaultValue: DataTypes.UUIDV4,  // Automatically generate UUID (version 4)
    primaryKey: true,                // Set as primary key
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

// Define the Account model
const Account = sequelize.define('Account', {
  accountId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,  // Automatically generate UUID (version 4)
    allowNull: false,
    unique: true,
    primaryKey: true,                // Set as primary key
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),  // Decimal type for financial data
    allowNull: false,
    defaultValue: 0.00,  
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

// Define the Notification model
const Notification = sequelize.define('Notification', {
  notificationId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,  // Automatically generate UUID
    primaryKey: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('unread', 'read'),  // Enum field to indicate the status
    defaultValue: 'unread',
    allowNull: false,
  },
  // Timestamps are automatically created by Sequelize
});

// Define the Transaction model
const Transaction = sequelize.define('Transaction', {
    senderId: {
        type: DataTypes.UUID,           // UUID to reference userId from the User model
        allowNull: false,
        references: {
            model: User,
            key: 'userId',
        }
    },
    receiverId: {
        type: DataTypes.UUID,           // UUID to reference userId from the User model
        allowNull: false,
        references: {
            model: User,
            key: 'userId',
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('credit', 'debit'),
        allowNull: false,
    },
}, {
    timestamps: true,
});

// Define associations for Transaction model
Transaction.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Transaction.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

// Define the associations between User and Account
User.hasOne(Account, {
  foreignKey: 'userId',  // Adds a foreign key 'userId' to the Account table
  onDelete: 'CASCADE',   // If a user is deleted, account is also deleted
});

Account.belongsTo(User, {
  foreignKey: 'userId',  // Establishes the foreign key 'userId'
});

// Define associations between User and Notification
User.hasMany(Notification, {
  foreignKey: 'userId',  // Foreign key in Notification model
  onDelete: 'CASCADE',   // If a user is deleted, notifications are also deleted
});

Notification.belongsTo(User, {
  foreignKey: 'userId',
  targetKey: 'userId',
});

// Sync the models with the database
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });  // { alter: true } ensures the table is modified if needed
    console.log('Models have been created and synced (if they did not exist).');
  } catch (error) {
    console.error('Error syncing models:', error);
  } finally {
    // Optionally close the connection after sync
    // await sequelize.close();
  }
};


module.exports = { User, Account, Notification, Transaction, syncModels };

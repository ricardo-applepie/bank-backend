const { User, Notification } = require('./models/tables'); // Adjust the path as needed

const createNotificationsForUser = async (username) => {
  try {
    // Find the user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.log(`User with username ${username} not found.`);
      return;
    }

    const userId = user.userId; // Get the user ID

    // Define notifications
    const notifications = [
      {
        message: "Your recent deposit of $1,000.00 has been credited to your account.",
        status: "unread",
        userId: userId,
      },
      {
        message: "A withdrawal of $200.00 was made from your account.",
        status: "unread",
        userId: userId,
      },
      {
        message: "Your account balance is low. Current balance: $50.00.",
        status: "unread",
        userId: userId,
      },
      {
        message: "Your monthly payment of $150.00 is due soon. Please ensure it is paid on time.",
        status: "unread",
        userId: userId,
      },
      {
        message: "Enjoy 10% cashback on all purchases made this month! Don't miss out.",
        status: "unread",
        userId: userId,
      },
      {
        message: "Your account statement for the month of August is ready to view.",
        status: "unread",
        userId: userId,
      },
      {
        message: "Celebrate the holidays with our special loan rates! Apply now.",
        status: "unread",
        userId: userId,
      },
      {
        message: "Merry Christmas! Enjoy a special $50 bonus added to your account.",
        status: "unread",
        userId: userId,
      },
      {
        message: "Your recent transaction of $500.00 was successful.",
        status: "unread",
        userId: userId,
      },
      {
        message: "We value your feedback! Please take a moment to share your experience with us.",
        status: "unread",
        userId: userId,
      },
    ];

    // Insert notifications into the database
    for (const notification of notifications) {
      await Notification.create(notification);
    }
    console.log("Notifications added successfully for user:", username);
  } catch (error) {
    console.error("Error adding notifications:", error);
  }
};

// Call the function to create notifications for 'wstest'
createNotificationsForUser('wstest');

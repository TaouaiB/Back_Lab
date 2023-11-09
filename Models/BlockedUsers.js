const mongoose = require("mongoose");

const BlockedUserSchema = new mongoose.Schema({
  blockedEmails: [
    {
      type: String,
      required: true,
      unique: true,
    },
  ],
});

const BlockedUser = mongoose.model("BlockedUser", BlockedUserSchema);

module.exports = BlockedUser;

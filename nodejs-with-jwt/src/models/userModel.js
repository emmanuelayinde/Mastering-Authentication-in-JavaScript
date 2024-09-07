// models/userModel.js
const users = [];

module.exports = {
  create: (user) => {
    users.push(user);
    return user;
  },
  findByEmail: (email) => {
    return users.find((user) => user.email === email);
  },
  users,
};

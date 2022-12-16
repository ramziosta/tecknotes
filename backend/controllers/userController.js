const User = require("../models/User");
const Note = require("../models/Note");

// handles the try catch blocks in async functions, no need to write them out
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//> desc Get all Users
//> route GET /Users
//> access Private
const getAllUsers = asyncHandler(async (req, res) => {
  // Get all User from MongoDB with out the password .lean() brings only daata like json with out any extra or functions
  const user = await User.find().select("-password").lean();

  // If no User
  if (!user?.length) {
    return res.status(400).json({ message: "No User found" });
  }

  res.json(user);
});

//> desc Get one Users
//> route GET /Users
//> access Private
const getOneUser = asyncHandler(async (req, res) => {
  // Get one User from MongoDB without the password .lean() brings only data like json with out any extra or functions
  
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  // Does the User exist to delete?
  const user = await User.findById(id).select('-password').exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  res.json(user);
});

//> desc Create new User
//> route POST /users
//> access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // Confirm data
  //< since some Users can have more than one role('User, 'admin', 'manager'), we enter the roles data as an array
  //> we check if the roles is an array, and we check if there are roles assigned
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate username
  // .exec() should be added when passing an argument like in .find({username})for async await functions in the end per mongoose docs
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // 10 salt rounds

  const userObject = { username, password: hashedPwd, roles };

  // Create and store new user
  const user = await User.create(userObject);

  if (user) {
    //created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

//> desc Update a User
//> route PATCH /User
//> access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  // Does the user exist to update?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updateUser = await user.save();

  res.json({ message: `${updateUser.username} updated` });
});

//> desc Delete a User
//> route DELETE /users
//> access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  // Does the user still have assigned notes?
  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "user has assigned notes" });
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }

  const result = await user.deleteOne();

  res.json({
    Message: `Username ${result.username} with ID ${result._id} deleted`,
  });
});

module.exports = {
  getAllUsers,
  getOneUser,
  createNewUser,
  updateUser,
  deleteUser,
};

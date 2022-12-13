const Employee = require("../models/Employee");
const Note = require("../models/Note");
// handles the try catch blocks in async functions, no need to write them out
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//> desc Get all employees
//> route GET /employees
//> access Private
const getAllEmployees = asyncHandler(async (req, res) => {
  // Get all employee from MongoDB with out the password .lean() brings only daata like json with out any extra or functions
  const employee = await Employee.find().select("-password").lean();

  // If no employee
  if (!employee?.length) {
    return res.status(400).json({ message: "No employee found" });
  }

  res.json(employee);
});

//> desc Get one employees
//> route GET /employees
//> access Private
const getOneEmployee = asyncHandler(async (req, res) => {
  // Get one employee from MongoDB without the password .lean() brings only daata like json with out any extra or functions
  const { id } = req.params;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  // Does the Employee exist to delete?
  const employee = await Employee.findById(id).select('-password').exec();

  if (!employee) {
    return res.status(400).json({ message: "Employee not found" });
  }

  res.json(employee);
});

//> desc Create new Employee
//> route POST /employee
//> access Private
const createNewEmployee = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // Confirm data
  //< since some employees can have more than one role('employee, 'admin', 'manager'), we enter the roles data as an array
  //> we check if the roles is an array, and we check if there are roles assigned
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate username
  // .exec() should be added when passing an argument like in .find({username})for async await functions in the end per mongoose docs
  const duplicate = await Employee.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // 10 salt rounds

  const employeeObject = { username, password: hashedPwd, roles };

  // Create and store new employee
  const employee = await Employee.create(employeeObject);

  if (employee) {
    //created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

//> desc Update a Employee
//> route PATCH /employee
//> access Private
const updateEmployee = asyncHandler(async (req, res) => {
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
  const employee = await Employee.findById(id).exec();

  if (!employee) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate
  const duplicate = await Employee.findOne({ username }).lean().exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  employee.username = username;
  employee.roles = roles;
  employee.active = active;

  if (password) {
    // Hash password
    employee.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updateEmployee = await employee.save();

  res.json({ message: `${updateEmployee.username} updated` });
});

//> desc Delete a Employee
//> route DELETE /employee
//> access Private
const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  // Does the user still have assigned notes?
  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "Employee has assigned notes" });
  }

  // Does the Employee exist to delete?
  const employee = await Employee.findById(id).exec();

  if (!employee) {
    return res.status(400).json({ message: "Employee not found" });
  }

  const result = await employee.deleteOne();

  res.json({
    Message: `Username ${result.username} with ID ${result._id} deleted`,
  });
});

module.exports = {
  getAllEmployees,
  getOneEmployee,
  createNewEmployee,
  updateEmployee,
  deleteEmployee,
};

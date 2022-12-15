const express = require("express");
const employeeRouter = express.Router();
const userRouter = express.Router();
const userController = require("../controllers/userController");

employeeRouter
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createNewUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

  userRouter
  .route('/')
  .get(userController.getOneUser)

module.exports = { employeeRouter, userRouter};


const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");

router
  .route("/")
  .get(employeeController.getAllEmployees)
  .post(employeeController.createNewEmployee)
  .patch(employeeController.updateEmployee)
  .delete(employeeController.deleteEmployee);

  router
  .route('/:id')
  .get(employeeController.getOneEmployee)

module.exports = router;

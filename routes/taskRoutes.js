const express = require("express");
const taskController = require("../controller/taskController");
const authController = require("../controller/authController");

const router = express.Router();

router.use(authController.protect, taskController.setUserId);

router.route("/").post(taskController.createTask).get(taskController.getTasks);

router
  .route("/:id")
  .get(taskController.getATask)
  .patch(taskController.updateATask)
  .delete(taskController.deleteTask);

module.exports = router;

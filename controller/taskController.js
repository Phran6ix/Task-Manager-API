const { read } = require("fs");
const Task = require("../model/taskModel");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const email = require("../utils/email");
const catchAsync = require("../utils/catchAsync");

exports.setUserId = (req, res, next) => {
  //  setting the user id
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.createTask = catchAsync(async (req, res, next) => {
  const task = await Task.create(req.body);

  const parsedDate = Date.parse(new Date(req.body.completedAt));

  if (!req.body.completedAt) return;

  if (parsedDate <= Date.now())
    return next(new AppError("Invalid Date/Time input, Please try again", 400));

  const sendEmailOnTimer = async () => {
    await email("A task Reminder", req.body.description);
    req.user.completedAt = true;
    await req.user.save();
  };

  const time = parsedDate - Date.now();

  setTimeout(sendEmailOnTimer, time);

  res.status(201).json({
    status: "Success",
    data: {
      task,
    },
  });
});

exports.getTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find();

  res.status(200).json({
    status: "Success",
    data: {
      tasks,
    },
  });
});

exports.getATask = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const task = await Task.findById(id);

  if (!task) throw new Error("Task cannot be found");

  res.status(200).json({
    status: "Success",
    data: {
      task,
    },
  });
});

exports.updateATask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndUpdate(id, req.body);

  if (!task) throw new Error("Task not Found");

  res.status(200).json({
    status: "Success",
    data: {
      task,
    },
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new Error("Task cannot be found");

  res.status(204).json({
    status: "Success",
    data: null,
  });
});

const { Schema, model, default: mongoose } = require("mongoose");
const validator = require("validator");

const TaskSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
      select: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must have a user"],
    },
  },
  {
    timestamp: true,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

TaskSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "-_v",
  });
  next();
});

const Task = new model("Task", TaskSchema);

module.exports = Task;

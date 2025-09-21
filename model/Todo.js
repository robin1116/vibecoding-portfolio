const { mongoose } = require("./mongoose");

const TodoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
      index: true,
    },
    priority: { type: Number, min: 1, max: 5, default: 3, index: true },
    dueDate: { type: Date },
    tags: { type: [String], default: [] },
    createdBy: { type: String, default: "", index: true },
  },
  { timestamps: true }
);

TodoSchema.index({ title: 1, createdBy: 1 });

const Todo = mongoose.models.Todo || mongoose.model("Todo", TodoSchema);

module.exports = { Todo };

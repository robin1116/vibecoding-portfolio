const express = require("express");
const router = express.Router();
const { Todo } = require("../model/Todo");

// POST /api/todos - 새 할 일 생성
router.post("/", async (req, res) => {
  try {
    const { title, description = "", status = "todo", priority = 3, dueDate, tags = [], createdBy = "" } = req.body || {};

    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "title은 필수 문자열입니다." });
    }

    const todo = await Todo.create({
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      createdBy,
    });

    return res.status(201).json(todo);
  } catch (error) {
    return res.status(500).json({ message: "할 일 생성 실패", error: error.message });
  }
});

module.exports = router;

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

// GET /api/todos - 목록 조회(기본: 최신순), 쿼리: status, createdBy, q, limit, page
router.get("/", async (req, res) => {
  try {
    const { status, createdBy, q, limit = 20, page = 1 } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 20, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);

    const filter = {};
    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;
    if (q) filter.title = { $regex: q, $options: "i" };

    const items = await Todo.find(filter)
      .sort({ createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit);

    const total = await Todo.countDocuments(filter);
    return res.json({ items, total, page: numericPage, limit: numericLimit });
  } catch (error) {
    return res.status(500).json({ message: "목록 조회 실패", error: error.message });
  }
});

// GET /api/todos/:id - 단건 상세 조회
router.get("/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "존재하지 않는 항목" });
    return res.json(todo);
  } catch (error) {
    return res.status(500).json({ message: "상세 조회 실패", error: error.message });
  }
});

// PATCH /api/todos/:id - 일부 수정
router.patch("/:id", async (req, res) => {
  try {
    const allow = ["title", "description", "status", "priority", "dueDate", "tags", "createdBy"];
    const updates = {};
    for (const key of allow) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.title !== undefined && typeof updates.title !== "string") {
      return res.status(400).json({ message: "title은 문자열이어야 합니다." });
    }
    const todo = await Todo.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!todo) return res.status(404).json({ message: "존재하지 않는 항목" });
    return res.json(todo);
  } catch (error) {
    return res.status(500).json({ message: "수정 실패", error: error.message });
  }
});

// DELETE /api/todos/:id - 삭제
router.delete("/:id", async (req, res) => {
  try {
    const result = await Todo.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "존재하지 않는 항목" });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "삭제 실패", error: error.message });
  }
});

module.exports = router;

const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

// 환경변수 MONGO_URI가 없으면 directConnection과 기본 포트/호스트를 사용
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://192.168.0.115:27017/?directConnection=true";
const SERVER_PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());
app.options("*", cors());

const mongoClient = new MongoClient(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  // IPv4 강제(환경에 따라 도움이 될 수 있음)
  family: 4,
});

let mongoReady = false;

async function ensureMongoConnection() {
  if (!mongoReady) {
    await mongoClient.connect();
    await mongoClient.db("admin").command({ ping: 1 });
    mongoReady = true;
  }
}

// Mongoose 연결 초기화
const { connectMongoose } = require("./model/mongoose");
connectMongoose()
  .then(() => console.log("Mongoose connected"))
  .catch((err) => console.error("Mongoose connection error:", err.message));

app.get("/", async (req, res) => {
  try {
    await ensureMongoConnection();
    res.status(200).send("<h1>MongoDB 연결 성공</h1>");
  } catch (error) {
    const details = [
      `name=${error.name ?? ""}`,
      `code=${error.code ?? ""}`,
      `cause=${error.cause ?? ""}`,
      `message=${error.message ?? ""}`,
    ]
      .filter(Boolean)
      .join("\n");
    res
      .status(500)
      .send(
        `<h1>MongoDB 연결 실패</h1><p>URI: ${MONGO_URI.replace(/:\\/\\/.*@/, "://*****@")}</p><pre style="white-space:pre-wrap">${details}</pre>`
      );
  }
});

app.get("/health", async (req, res) => {
  try {
    await ensureMongoConnection();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Todos API 라우터 마운트 (routers 디렉토리)
const todosRouter = require("./routers/todos");
app.use("/api/todos", todosRouter);

// 앱 시작 시 1회 연결 시도(실패해도 서버는 뜨도록)
ensureMongoConnection()
  .then(() => console.log("MongoDB initial connection OK"))
  .catch((err) => console.error("MongoDB initial connection FAILED:", err.message));

app.listen(SERVER_PORT, () => {
  console.log(`Server listening on http://localhost:${SERVER_PORT}`);
});

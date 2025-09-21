const express = require("express");
const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://192.168.0.115:27017";
const SERVER_PORT = process.env.PORT || 3000;

const app = express();

const mongoClient = new MongoClient(MONGO_URI, {
  serverSelectionTimeoutMS: 3000,
});

async function ensureMongoConnection() {
  await mongoClient.connect();
  await mongoClient.db("admin").command({ ping: 1 });
}

app.get("/", async (req, res) => {
  try {
    await ensureMongoConnection();
    res.status(200).send("<h1>MongoDB 연결 성공</h1>");
  } catch (error) {
    res
      .status(500)
      .send(
        `<h1>MongoDB 연결 실패</h1><pre style="white-space:pre-wrap">${error.message}</pre>`
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

app.listen(SERVER_PORT, () => {
  console.log(`Server listening on http://localhost:${SERVER_PORT}`);
});

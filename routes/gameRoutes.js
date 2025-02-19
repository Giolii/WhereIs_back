const { PrismaClient } = require("@prisma/client");
const express = require("express");
const router = express.Router();
const prisma = new PrismaClient();

router.get("/position", async (req, res) => {
  const { x, y, char } = req.query;
  const xNum = parseFloat(x);
  const yNum = parseFloat(y);

  if (!x || !y || !char)
    return res.status(400).json({ message: "Missing parameters" });
  try {
    const result = await prisma.character.findUnique({
      where: {
        name: char,
      },
    });

    if (!result)
      return res
        .status(404)
        .json({ message: "Character not found", timestamp: new Date() });

    if (
      result.xStart <= xNum &&
      result.xEnd >= xNum &&
      result.yStart <= yNum &&
      result.yEnd >= yNum
    ) {
      return res.status(200).json({
        message: "Position correct",
        valid: true,
        timestamp: new Date(),
      });
    } else {
      return res.status(200).json({
        message: "Wrong position",
        valid: false,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error checking position" });
  }
});

router.get("/chars", async (req, res) => {
  try {
    const result = await prisma.character.findMany({});

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No characters found" });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching characters", error);
    return res.status(500).json({ error: "Error fetching characters" });
  }
});

router.post("/start", (req, res) => {
  req.session.gameStartTime = new Date().getTime();
  res.json({ startTime: req.session.gameStartTime });
});

router.post("/end", (req, res) => {
  if (!req.session.gameStartTime) {
    return res.status(400).json({ error: "No game start time found" });
  }
  req.session.endTime = new Date().getTime();
  const endTime = req.session.endTime;
  const totalTime = endTime - req.session.gameStartTime;
  res.json({ totalTime, endTime });
});

router.post("/save", async (req, res) => {
  if (!req.session.endTime || !req.session.gameStartTime) {
    return res.status(400).json({ error: "No active game found" });
  }
  if (!req.body.name) {
    return res.status(400).json({ error: "No username provided" });
  }
  const totalTime = req.session.endTime - req.session.gameStartTime;
  try {
    const result = await prisma.ranking.create({
      data: {
        name: req.body.name,
        time: totalTime,
      },
    });
    if (!result) {
      return res
        .status(400)
        .json({ error: "Error while inserting data in the database" });
    }
    delete req.session.gameStartTime;
    delete req.session.endTime;
    res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error: "Error saving score" });
  }
});

router.get("/rank", async (req, res) => {
  try {
    const result = await prisma.ranking.findMany({
      orderBy: {
        time: "asc",
      },
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No ranking found" });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching ranking", error);
    return res.status(500).json({ error: "Error fetching ranking" });
  }
});

module.exports = router;

const express = require("express");
const {getFeatures, createFeatures} = require("../controllers/feature");
const router = express.Router();

router.get("/api/features", getFeatures);
router.post("/api/features/add", createFeatures);

module.exports = router;

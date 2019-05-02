const express = require("express");
const {getFeatures, createFeatures, getFeatureById} = require("../controllers/feature");
const router = express.Router();

router.get("/api/features", getFeatures);
router.get("/api/feature/:featureId", getFeatureById);
router.post("/api/features/add", createFeatures);

module.exports = router;

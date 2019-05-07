const express = require("express");
const {getFeatures, createFeatures, getFeatureById, updateFeature, deleteFeature} = require("../controllers/feature");
const {requireSignin, isMod} = require("../controllers/auth");

const router = express.Router();

router.get("/api/features", getFeatures);
router.get("/api/feature/:featureId", getFeatureById);
router.post("/api/features/add", createFeatures);
router.put("/api/feature/:featureId", requireSignin, isMod, updateFeature);
router.delete("/api/feature/:featureId", requireSignin, isMod, deleteFeature);

module.exports = router;

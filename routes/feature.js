const express = require("express");
const {getFeatures, createFeatures, getFeatureById, featureById, updateFeature} = require("../controllers/feature");
const {requireSignin, isMod} = require("../controllers/auth");

const router = express.Router();

router.get("/api/features", getFeatures);
router.get("/api/feature/:featureId", getFeatureById);
router.post("/api/features/add", createFeatures);
router.put("/api/feature/:featureId", requireSignin, isMod, updateFeature);

router.param("featureId", featureById)
module.exports = router;

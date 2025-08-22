const express = require("express");
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole } = require("../controllers/roleController");
const { authenticateToken } = require("../middleware/auth");

router.get("/", authenticateToken, getRoles);
router.post("/", authenticateToken, createRole);
router.put("/:id", authenticateToken, updateRole);
router.delete("/:id", authenticateToken, deleteRole);

module.exports = router;
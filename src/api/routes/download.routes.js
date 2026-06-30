const { Router } = require("express");
const path = require("path");
const fs = require("fs");

const router = Router();

router.get("/setup", (req, res) => {
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  const isWindows = ua.includes("windows") || ua.includes("win64");
  const fileName = isWindows ? "install.bat" : "install.sh";
  const filePath = path.resolve(__dirname, "../../../scripts", fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Installer script not found" });
  }

  res.download(filePath, `rag-assistant-setup${isWindows ? ".bat" : ".sh"}`);
});

module.exports = router;

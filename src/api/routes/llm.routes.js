const { Router } = require("express");
const { getProvidersInfo } = require("../../llm/llmRouter");

const router = Router();

router.get("/providers", (req, res) => {
  res.json({
    success: true,
    data: getProvidersInfo(),
  });
});

module.exports = router;

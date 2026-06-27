// Result re-ranker.
// Scores retrieved chunks by a combination of vector distance and keyword overlap
// with the original question, then returns the top-k most relevant results.

const rerank = (question, results, topK = 5) => {
  const questionWords = new Set(
    question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
  );

  const scored = results.map((item) => {
    const textWords = new Set(
      (item.text || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(Boolean)
    );

    let overlap = 0;
    for (const word of questionWords) {
      if (textWords.has(word)) overlap++;
    }

    const keywordScore = questionWords.size > 0 ? overlap / questionWords.size : 0;
    const distanceScore = 1 - (item.score || 0);
    const combinedScore = 0.6 * distanceScore + 0.4 * keywordScore;

    return { ...item, combinedScore };
  });

  scored.sort((a, b) => b.combinedScore - a.combinedScore);
  return scored.slice(0, topK);
};

module.exports = { rerank };

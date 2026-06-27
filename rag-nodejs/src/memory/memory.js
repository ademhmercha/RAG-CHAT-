// Conversation memory.
// Maintains short-term and long-term conversation history for context-aware responses.

class Memory {
  constructor(maxTokens = 2000) {
    this.maxTokens = maxTokens;
    this.history = [];
  }

  add(role, content) {
    this.history.push({ role, content, timestamp: new Date() });
    this.trim();
  }

  getHistory() {
    return this.history.map((entry) => ({
      role: entry.role,
      content: entry.content,
    }));
  }

  trim() {
    let total = 0;
    const trimmed = [];
    for (let i = this.history.length - 1; i >= 0; i--) {
      total += this.history[i].content.length;
      if (total > this.maxTokens) break;
      trimmed.unshift(this.history[i]);
    }
    this.history = trimmed;
  }

  clear() {
    this.history = [];
  }
}

module.exports = { Memory };

const axios = require("axios");
const UsageLog = require("../models/UsageLog");

const PROVIDERS = {
  OLLAMA: "ollama",
  GROQ: "groq",
  GEMINI: "gemini",
  OPENROUTER: "openrouter",
};

const PRIORITY = [
  PROVIDERS.OLLAMA,
  PROVIDERS.GROQ,
  PROVIDERS.GEMINI,
  PROVIDERS.OPENROUTER,
];

const PROVIDERS_INFO = [
  {
    id: PROVIDERS.OLLAMA,
    name: "Ollama",
    models: ["llama3.2"],
    defaultModel: "llama3.2",
    requiresKey: false,
    keyLink: null,
    keyPlaceholder: null,
  },
  {
    id: PROVIDERS.GROQ,
    name: "Groq",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    defaultModel: "llama-3.3-70b-versatile",
    requiresKey: true,
    keyLink: "https://console.groq.com/keys",
    keyPlaceholder: "gsk_...",
  },
  {
    id: PROVIDERS.GEMINI,
    name: "Google Gemini",
    models: ["gemini-2.5-flash", "gemini-2.0-flash"],
    defaultModel: "gemini-2.5-flash",
    requiresKey: true,
    keyLink: "https://aistudio.google.com/apikey",
    keyPlaceholder: "AIza...",
  },
  {
    id: PROVIDERS.OPENROUTER,
    name: "OpenRouter",
    models: ["meta-llama/llama-3.3-70b-instruct:free", "qwen/qwen3-coder:free", "mistralai/mistral-small-3.1-24b-instruct:free"],
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    requiresKey: true,
    keyLink: "https://openrouter.ai/keys",
    keyPlaceholder: "sk-or-...",
  },
];

const getConfig = (provider, options = {}) => {
  switch (provider) {
    case PROVIDERS.OLLAMA:
      return {
        host: process.env.OLLAMA_HOST || "http://ollama:11434",
        model: options.model || process.env.OLLAMA_MODEL || "llama3.2",
      };
    case PROVIDERS.GROQ:
      return {
        apiKey: options.apiKey || process.env.GROQ_API_KEY,
        model: options.model || process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        baseUrl: "https://api.groq.com/openai/v1",
      };
    case PROVIDERS.GEMINI:
      return {
        apiKey: options.apiKey || process.env.GEMINI_API_KEY,
        model: options.model || process.env.GEMINI_MODEL || "gemini-2.5-flash",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      };
    case PROVIDERS.OPENROUTER:
      return {
        apiKey: options.apiKey || process.env.OPENROUTER_API_KEY,
        model: options.model || process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
        baseUrl: "https://openrouter.ai/api/v1",
      };
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
};

const isRetryable = (err) => {
  if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") return true;
  if (err.response) {
    const status = err.response.status;
    return status === 429 || (status >= 500 && status < 600);
  }
  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") return true;
  return false;
};

const toGeminiMessages = (messages) => {
  let systemInstruction = null;
  const contents = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemInstruction = (systemInstruction || "") + msg.content + "\n";
    } else if (msg.role === "user") {
      contents.push({ role: "user", parts: [{ text: msg.content }] });
    } else if (msg.role === "assistant") {
      contents.push({ role: "model", parts: [{ text: msg.content }] });
    }
  }

  return {
    systemInstruction: systemInstruction ? systemInstruction.trim() : null,
    contents,
  };
};

const callOllama = async (messages, options) => {
  const cfg = getConfig(PROVIDERS.OLLAMA, options);
  const res = await axios.post(`${cfg.host}/api/chat`, {
    model: cfg.model,
    messages,
    stream: false,
    options: {
      temperature: options.temperature ?? 0.7,
      num_predict: options.maxTokens || 2048,
    },
  }, { timeout: options.timeout || 120000 });
  return res.data.message.content;
};

const callOllamaStream = async (messages, options, onToken) => {
  const cfg = getConfig(PROVIDERS.OLLAMA, options);
  const res = await axios.post(`${cfg.host}/api/chat`, {
    model: cfg.model,
    messages,
    stream: true,
    options: {
      temperature: options.temperature ?? 0.7,
      num_predict: options.maxTokens || 2048,
    },
  }, { responseType: "stream", timeout: options.timeout || 600000 });

  return new Promise((resolve, reject) => {
    const stream = res.data;
    let buffer = "", full = "";

    stream.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            full += parsed.message.content;
            onToken(parsed.message.content);
          }
          if (parsed.done) resolve(full);
        } catch { /* skip malformed */ }
      }
    });
    stream.on("error", reject);
    stream.on("end", () => resolve(full));
  });
};

const callOpenAI = async (baseUrl, apiKey, model, messages, options) => {
  const res = await axios.post(`${baseUrl}/chat/completions`, {
    model,
    messages,
    max_tokens: options.maxTokens || 2048,
    temperature: options.temperature ?? 0.7,
    stream: false,
  }, {
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    timeout: options.timeout || 30000,
  });
  return res.data.choices[0].message.content;
};

const callOpenAIStream = async (baseUrl, apiKey, model, messages, options, onToken) => {
  const res = await axios.post(`${baseUrl}/chat/completions`, {
    model,
    messages,
    max_tokens: options.maxTokens || 2048,
    temperature: options.temperature ?? 0.7,
    stream: true,
  }, {
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    responseType: "stream",
    timeout: options.timeout || 120000,
  });

  return new Promise((resolve, reject) => {
    const stream = res.data;
    let buffer = "", full = "";

    stream.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data: ")) continue;
        const data = t.slice(6);
        if (data === "[DONE]") { resolve(full); return; }
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content || "";
          if (delta) { full += delta; onToken(delta); }
        } catch { /* skip */ }
      }
    });
    stream.on("error", reject);
    stream.on("end", () => resolve(full));
  });
};

const callGemini = async (messages, options) => {
  const cfg = getConfig(PROVIDERS.GEMINI, options);
  const { systemInstruction, contents } = toGeminiMessages(messages);
  const body = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens || 2048,
    },
  };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };

  const res = await axios.post(
    `${cfg.baseUrl}/models/${cfg.model}:generateContent?key=${cfg.apiKey}`,
    body,
    { timeout: options.timeout || 30000 }
  );
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const callGeminiStream = async (messages, options, onToken) => {
  const cfg = getConfig(PROVIDERS.GEMINI, options);
  const { systemInstruction, contents } = toGeminiMessages(messages);
  const body = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens || 2048,
    },
  };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };

  const res = await axios.post(
    `${cfg.baseUrl}/models/${cfg.model}:streamGenerateContent?alt=sse&key=${cfg.apiKey}`,
    body,
    { responseType: "stream", timeout: options.timeout || 120000 }
  );

  return new Promise((resolve, reject) => {
    const stream = res.data;
    let buffer = "", full = "";

    stream.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data: ")) continue;
        const data = t.slice(6);
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (text) { full += text; onToken(text); }
        } catch { /* skip */ }
      }
    });
    stream.on("error", reject);
    stream.on("end", () => resolve(full));
  });
};

const generateResponse = async (messages, options = {}) => {
  const errors = [];
  const providersToTry = options.provider ? [options.provider] : PRIORITY;

  for (const provider of providersToTry) {
    if (provider !== PROVIDERS.OLLAMA) {
      const cfg = getConfig(provider, options);
      if (!cfg.apiKey) {
        console.warn(`[LLM Router] ${provider}: skipped (no API key)`);
        errors.push({ provider, reason: "No API key" });
        if (options.provider) break;
        continue;
      }
    }

    console.warn(`[LLM Router] → ${provider}`);
    const start = Date.now();
    let cfg;
    try {
      let result;
      switch (provider) {
        case PROVIDERS.OLLAMA:
          cfg = getConfig(provider, options);
          result = await callOllama(messages, options);
          break;
        case PROVIDERS.GROQ: {
          cfg = getConfig(provider, options);
          result = await callOpenAI(cfg.baseUrl, cfg.apiKey, cfg.model, messages, options);
          break;
        }
        case PROVIDERS.GEMINI:
          cfg = getConfig(provider, options);
          result = await callGemini(messages, options);
          break;
        case PROVIDERS.OPENROUTER: {
          cfg = getConfig(provider, options);
          result = await callOpenAI(cfg.baseUrl, cfg.apiKey, cfg.model, messages, options);
          break;
        }
      }
      await logUsage(provider, cfg?.model || "unknown", options, Date.now() - start, true);
      console.warn(`[LLM Router] ✓ ${provider}`);
      return result;
    } catch (err) {
      const reason = err.response
        ? `HTTP ${err.response.status}`
        : err.code || err.message;
      const retry = isRetryable(err);
      await logUsage(provider, cfg?.model || "unknown", options, Date.now() - start, false, reason);
      console.warn(`[LLM Router] ✗ ${provider} (${reason})${retry ? " → fallback" : " → abort"}`);
      errors.push({ provider, reason, status: err.response?.status });
      if (!retry || options.provider) break;
    }
  }

  const detail = errors.map(e => `${e.provider}: ${e.reason}`).join("; ");
  throw new Error(`All LLM providers failed: ${detail}`);
};

const generateResponseStream = async (messages, options = {}, onToken) => {
  const errors = [];
  const providersToTry = options.provider ? [options.provider] : PRIORITY;

  for (const provider of providersToTry) {
    if (provider !== PROVIDERS.OLLAMA) {
      const cfg = getConfig(provider, options);
      if (!cfg.apiKey) {
        console.warn(`[LLM Router] ${provider}: skipped (no API key)`);
        errors.push({ provider, reason: "No API key" });
        if (options.provider) break;
        continue;
      }
    }

    console.warn(`[LLM Router] → ${provider} (stream)`);
    const start = Date.now();
    let cfg;
    try {
      let result;
      switch (provider) {
        case PROVIDERS.OLLAMA:
          cfg = getConfig(provider, options);
          result = await callOllamaStream(messages, options, onToken);
          break;
        case PROVIDERS.GROQ: {
          cfg = getConfig(provider, options);
          result = await callOpenAIStream(cfg.baseUrl, cfg.apiKey, cfg.model, messages, options, onToken);
          break;
        }
        case PROVIDERS.GEMINI:
          cfg = getConfig(provider, options);
          result = await callGeminiStream(messages, options, onToken);
          break;
        case PROVIDERS.OPENROUTER: {
          cfg = getConfig(provider, options);
          result = await callOpenAIStream(cfg.baseUrl, cfg.apiKey, cfg.model, messages, options, onToken);
          break;
        }
      }
      await logUsage(provider, cfg?.model || "unknown", options, Date.now() - start, true);
      console.warn(`[LLM Router] ✓ ${provider} (stream)`);
      return result;
    } catch (err) {
      const reason = err.response
        ? `HTTP ${err.response.status}`
        : err.code || err.message;
      const retry = isRetryable(err);
      await logUsage(provider, cfg?.model || "unknown", options, Date.now() - start, false, reason);
      console.warn(`[LLM Router] ✗ ${provider} (stream) (${reason})${retry ? " → fallback" : " → abort"}`);
      errors.push({ provider, reason, status: err.response?.status });
      if (!retry || options.provider) break;
    }
  }

  const detail = errors.map(e => `${e.provider}: ${e.reason}`).join("; ");
  throw new Error(`All LLM providers failed: ${detail}`);
};

const logUsage = async (provider, model, options, durationMs, success, error = null) => {
  if (!options.userId) return;
  try {
    await UsageLog.create({
      userId: options.userId,
      provider,
      model,
      durationMs,
      success,
      error,
    });
  } catch (err) {
    console.error("[UsageLog] Failed to log usage:", err.message);
  }
};

const getProvidersInfo = () => PROVIDERS_INFO.map(p => ({
  ...p,
  hasKey: p.requiresKey ? !!getConfig(p.id).apiKey : true,
}));

const healthCheck = async () => {
  const checks = PROVIDERS_INFO.map(p => ({
    provider: p.id,
    fn: async () => {
      if (p.requiresKey && !getConfig(p.id).apiKey) {
        return { provider: p.id, ok: false, error: "No API key" };
      }
      try {
        if (p.id === PROVIDERS.OLLAMA) {
          const cfg = getConfig(PROVIDERS.OLLAMA);
          await axios.get(`${cfg.host}/api/tags`, { timeout: 5000 });
        } else if (p.id === PROVIDERS.GROQ || p.id === PROVIDERS.OPENROUTER) {
          const cfg = getConfig(p.id);
          await axios.get(`${cfg.baseUrl}/models`, {
            headers: { Authorization: `Bearer ${cfg.apiKey}` },
            timeout: 5000,
          });
        } else if (p.id === PROVIDERS.GEMINI) {
          const cfg = getConfig(PROVIDERS.GEMINI);
          await axios.get(`${cfg.baseUrl}/models/${cfg.model}?key=${cfg.apiKey}`, { timeout: 5000 });
        }
        return { provider: p.id, ok: true };
      } catch (err) {
        return { provider: p.id, ok: false, error: err.message };
      }
    },
  }));

  const results = await Promise.allSettled(checks.map(c => c.fn()));
  return results.map(r => r.status === "fulfilled" ? r.value : { ok: false, error: r.reason?.message });
};

module.exports = { generateResponse, generateResponseStream, healthCheck, getProvidersInfo, PROVIDERS };

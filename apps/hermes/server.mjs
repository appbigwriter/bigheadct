import crypto from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";

const PORT = Number(process.env.PORT ?? 8642);
const BIND_HOST = process.env.BIND_HOST ?? "0.0.0.0";
const API_KEY = process.env.HERMES_API_KEY ?? "";
const DEFAULT_MODEL = process.env.HERMES_DEFAULT_MODEL ?? "hermes";
const PROFILES_DIR = process.env.HERMES_PROFILES_DIR ?? "";

function json(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function text(res, statusCode, body) {
  res.writeHead(statusCode, {
    "content-type": "text/plain; charset=utf-8",
  });
  res.end(body);
}

function safeJsonParse(input, fallback = null) {
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
}

function countTokensLike(text) {
  if (!text) return 0;
  const normalized = String(text).trim();
  if (!normalized) return 0;
  return Math.max(1, Math.ceil(normalized.length / 4));
}

function countMessageTokens(messages) {
  return messages.reduce((total, message) => {
    const content = typeof message?.content === "string" ? message.content : "";
    const toolCalls = Array.isArray(message?.tool_calls)
      ? JSON.stringify(message.tool_calls)
      : "";
    return total + countTokensLike(content) + countTokensLike(toolCalls);
  }, 0);
}

function normalizeToolName(tool) {
  return tool?.function?.name ?? tool?.name ?? "";
}

function latestUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message?.role === "user" && typeof message.content === "string") {
      return message.content.trim();
    }
  }
  return "";
}

function latestToolContext(messages) {
  const collected = [];
  for (let i = 0; i < messages.length; i += 1) {
    const message = messages[i];
    if (message?.role === "tool" && typeof message.content === "string") {
      collected.push(message.content);
    }
  }
  return collected.join("\n");
}

function looksLikeKnowledgeRequest(text) {
  return /\b(manual|documenta[cç][aã]o|conhecimento|base de conhecimento|pesquisa|pesquise|rag|help|ajuda)\b/i.test(
    text,
  );
}

function extractAuthorizedProfile(authHeader) {
  if (!API_KEY) return { ok: true, reason: "api_key_disabled" };
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
  if (!token || token !== API_KEY) {
    return { ok: false, reason: "invalid bearer token" };
  }
  return { ok: true };
}

async function readProfile(profile) {
  if (!PROFILES_DIR || !profile) return null;
  const filePath = path.join(PROFILES_DIR, `${profile}.yaml`);
  try {
    await stat(filePath);
  } catch {
    return null;
  }
  try {
    const raw = await readFile(filePath, "utf8");
    const data = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separatorIndex = trimmed.indexOf(":");
      if (separatorIndex < 0) continue;
      const key = trimmed.slice(0, separatorIndex).trim();
      const valueText = trimmed.slice(separatorIndex + 1).trim();
      if (!key) continue;
      try {
        data[key] = JSON.parse(valueText);
      } catch {
        data[key] = valueText;
      }
    }
    return data;
  } catch {
    return null;
  }
}

function summarizeTask(messages, profileData) {
  const userText = latestUserText(messages);
  const profileName = typeof profileData?.name === "string" ? profileData.name : "Hermes local";
  const workspace = typeof profileData?.workspace === "string" ? profileData.workspace : "";
  const systemPrompt = typeof profileData?.system_prompt === "string" ? profileData.system_prompt : "";
  const toolContext = latestToolContext(messages);

  return {
    profileName,
    workspace,
    systemPrompt,
    userText,
    toolContext,
  };
}

function chooseToolCall(messages, tools) {
  const userText = latestUserText(messages);
  if (!tools?.length || !looksLikeKnowledgeRequest(userText)) return null;
  const query = userText || "consulta de conhecimento";
  return {
    id: `call_${crypto.createHash("sha256").update(query).digest("hex").slice(0, 16)}`,
    type: "function",
    function: {
      name: "query_knowledge_base",
      arguments: JSON.stringify({ query }),
    },
  };
}

function resolveSchemaValue(schema, context, pathParts = []) {
  if (!schema || typeof schema !== "object") return null;
  if (Object.prototype.hasOwnProperty.call(schema, "const")) return schema.const;
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0];

  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  switch (type) {
    case "object": {
      const result = {};
      const properties = schema.properties ?? {};
      const required = new Set(Array.isArray(schema.required) ? schema.required : []);
      for (const [key, childSchema] of Object.entries(properties)) {
        const childValue = resolveSchemaValue(childSchema, context, [...pathParts, key]);
        if (childValue !== undefined && (required.has(key) || childValue !== null)) {
          result[key] = childValue;
        }
      }
      if (Object.keys(result).length === 0 && required.size === 0) {
        return {};
      }
      return result;
    }
    case "array": {
      const itemSchema = schema.items ?? {};
      return [resolveSchemaValue(itemSchema, context, [...pathParts, "0"])];
    }
    case "string": {
      const key = pathParts[pathParts.length - 1] ?? "";
      const userText = context.userText || "";
      const toolContext = context.toolContext || "";
      const profileName = context.profileName || "Hermes local";
      const summary = userText || toolContext || "execução local do Hermes";
      if (/(^|_)(id|identifier|uuid)$/i.test(key)) {
        return crypto.createHash("sha256").update(summary).digest("hex").slice(0, 12);
      }
      if (/name|title|subject/i.test(key)) {
        return profileName;
      }
      if (/status|state/i.test(key)) {
        return "ok";
      }
      if (/summary|description|content|message|answer|result|output|text|details?/i.test(key)) {
        const compact = summary.replace(/\s+/g, " ").trim();
        return compact.slice(0, 240) || `Resposta local de ${profileName}`;
      }
      return profileName;
    }
    case "integer":
    case "number":
      return 1;
    case "boolean":
      return false;
    case "null":
      return null;
    default: {
      if (schema.properties) {
        return resolveSchemaValue({ ...schema, type: "object" }, context, pathParts);
      }
      return context.profileName || "Hermes local";
    }
  }
}

function buildStructuredContent(schema, context) {
  const output = resolveSchemaValue(schema, context);
  if (output && typeof output === "object" && !Array.isArray(output)) {
    return output;
  }
  return {
    summary: context.userText || "Resposta local do Hermes",
    agent: context.profileName,
  };
}

async function handleChatCompletion(req, res, body) {
  const authCheck = extractAuthorizedProfile(req.headers.authorization);
  if (!authCheck.ok) {
    json(res, 401, { error: { message: authCheck.reason, type: "authentication_error" } });
    return;
  }

  const idempotencyKey = req.headers["idempotency-key"];
  if (typeof idempotencyKey !== "string" || !idempotencyKey.trim()) {
    json(res, 400, {
      error: { message: "Idempotency-Key header is required", type: "invalid_request_error" },
    });
    return;
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const profile = typeof req.headers["x-hermes-profile"] === "string" ? req.headers["x-hermes-profile"] : "";
  const profileData = await readProfile(profile);
  const context = summarizeTask(messages, profileData);
  const toolCall = chooseToolCall(messages, body.tools);

  const responseFormat = body.response_format ?? body.text?.format ?? null;
  const schema =
    responseFormat?.json_schema?.schema ??
    responseFormat?.schema ??
    responseFormat?.responseJsonSchema ??
    null;
  const structured = schema && typeof schema === "object";

  const message = toolCall
    ? {
        role: "assistant",
        content: null,
        tool_calls: [toolCall],
      }
    : {
        role: "assistant",
        content: structured
          ? JSON.stringify(buildStructuredContent(schema, context))
          : [
              `Hermes local (${context.profileName}) processou a solicitação.`,
              context.userText ? `Entrada: ${context.userText}` : "",
              context.toolContext ? `Base de conhecimento: ${context.toolContext}` : "",
            ]
              .filter(Boolean)
              .join(" "),
        tool_calls: null,
      };

  const contentText = typeof message.content === "string" ? message.content : JSON.stringify(message.tool_calls ?? []);
  const promptTokens = countMessageTokens(messages) + countTokensLike(profileData?.system_prompt ?? "");
  const completionTokens = countTokensLike(contentText) + countTokensLike(JSON.stringify(message.tool_calls ?? []));
  const response = {
    id: `chatcmpl-${crypto
      .createHash("sha256")
      .update([idempotencyKey, profile, contentText].join(":"))
      .digest("hex")
      .slice(0, 24)}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: body.model || DEFAULT_MODEL,
    choices: [
      {
        index: 0,
        message,
        finish_reason: toolCall ? "tool_calls" : "stop",
      },
    ],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    },
  };
  json(res, 200, response);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  return safeJsonParse(raw, null);
}

async function requestHandler(req, res) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  if (req.method === "GET" && url.pathname === "/health/live") {
    json(res, 200, {
      status: "alive",
      service: "hermes-local",
      profilesDirConfigured: Boolean(PROFILES_DIR),
    });
    return;
  }
  if (req.method === "GET" && url.pathname === "/health/ready") {
    const ready = Boolean(PROFILES_DIR);
    json(res, ready ? 200 : 503, {
      status: ready ? "ready" : "not_ready",
      service: "hermes-local",
      profilesDirConfigured: Boolean(PROFILES_DIR),
    });
    return;
  }
  if (req.method === "POST" && url.pathname === "/v1/chat/completions") {
    const body = await readBody(req);
    if (!body || typeof body !== "object") {
      json(res, 400, {
        error: { message: "Request body must be valid JSON", type: "invalid_request_error" },
      });
      return;
    }
    await handleChatCompletion(req, res, body);
    return;
  }
  json(res, 404, { error: { message: "Not found", type: "invalid_request_error" } });
}

const server = http.createServer((req, res) => {
  requestHandler(req, res).catch((error) => {
    console.error("Hermes local server error", error);
    json(res, 500, { error: { message: "internal server error", type: "server_error" } });
  });
});

server.listen(PORT, BIND_HOST, () => {
  console.log(`Hermes local listening on http://${BIND_HOST}:${PORT}`);
});

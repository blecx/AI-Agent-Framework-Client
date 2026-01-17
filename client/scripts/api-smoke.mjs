import { pathToFileURL } from 'node:url';

const timeoutMs = Number.parseInt(process.env.API_TIMEOUT_MS || '10000', 10);

export function normalizeBaseUrl(input) {
  const base = (input || 'http://localhost:8000').trim().replace(/\/+$/, '');
  // If someone passes http://host:8000/api/v1, treat that as versioned base.
  return base;
}

export function rootFromBase(baseUrl) {
  return baseUrl.replace(/\/api\/v1$/, '');
}

export async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(
        `HTTP ${res.status} ${res.statusText} for ${url}${text ? `\n${text}` : ''}`,
      );
    }
    const json = await res.json();
    return json;
  } finally {
    clearTimeout(timer);
  }
}

export function assertHealthy(payload, url) {
  if (!payload || payload.status !== 'healthy') {
    throw new Error(
      `Expected {status:"healthy"} from ${url}, got: ${JSON.stringify(payload)}`,
    );
  }
}

export function assertJsonArray(payload, url) {
  if (!Array.isArray(payload)) {
    throw new Error(
      `Expected JSON array from ${url}, got: ${JSON.stringify(payload)}`,
    );
  }
}

export async function runSmokeChecks() {
  const baseUrl = normalizeBaseUrl(process.env.API_BASE_URL);
  const rootUrl = rootFromBase(baseUrl);

  const healthUrl = `${rootUrl}/health`;
  const v1HealthUrl = `${rootUrl}/api/v1/health`;
  const v1ProjectsUrl = `${rootUrl}/api/v1/projects`;

  console.log(`API_BASE_URL=${baseUrl}`);
  console.log(`Checking ${healthUrl}`);
  const health = await fetchJson(healthUrl);
  assertHealthy(health, healthUrl);

  console.log(`Checking ${v1HealthUrl}`);
  const v1 = await fetchJson(v1HealthUrl);
  assertHealthy(v1, v1HealthUrl);

  console.log(`Checking ${v1ProjectsUrl}`);
  const projects = await fetchJson(v1ProjectsUrl);
  assertJsonArray(projects, v1ProjectsUrl);

  console.log('API smoke checks passed.');
}

function isExecutedAsScript() {
  try {
    const invoked = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
    return Boolean(invoked) && import.meta.url === invoked;
  } catch {
    return false;
  }
}

if (isExecutedAsScript()) {
  runSmokeChecks().catch((err) => {
    console.error(err?.stack || String(err));
    process.exit(1);
  });
}

const timeoutMs = Number.parseInt(process.env.API_TIMEOUT_MS || '10000', 10);

function normalizeBaseUrl(input) {
  const base = (input || 'http://localhost:8000').trim().replace(/\/+$/, '');
  // If someone passes http://host:8000/api/v1, treat that as versioned base.
  return base;
}

function rootFromBase(baseUrl) {
  return baseUrl.replace(/\/api\/v1$/, '');
}

async function fetchJson(url) {
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

function assertHealthy(payload, url) {
  if (!payload || payload.status !== 'healthy') {
    throw new Error(
      `Expected {status:"healthy"} from ${url}, got: ${JSON.stringify(payload)}`,
    );
  }
}

async function main() {
  const baseUrl = normalizeBaseUrl(process.env.API_BASE_URL);
  const rootUrl = rootFromBase(baseUrl);

  const healthUrl = `${rootUrl}/health`;
  const v1HealthUrl = `${rootUrl}/api/v1/health`;

  console.log(`API_BASE_URL=${baseUrl}`);
  console.log(`Checking ${healthUrl}`);
  const health = await fetchJson(healthUrl);
  assertHealthy(health, healthUrl);

  console.log(`Checking ${v1HealthUrl}`);
  const v1 = await fetchJson(v1HealthUrl);
  assertHealthy(v1, v1HealthUrl);

  console.log('API smoke checks passed.');
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});

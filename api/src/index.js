async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',');
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin, env);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // POST /submit - create artifact
    if (url.pathname === '/submit' && request.method === 'POST') {
      try {
        const body = await request.json();

        if (!body.kind || !body.content) {
          return new Response(JSON.stringify({ error: 'Missing required fields: kind, content' }), {
            status: 400, headers
          });
        }

        const artifact = {
          kind: body.kind,
          content: body.content,
          source_url: body.source_url || null,
          submitter: body.submitter || 'public',
          tags: body.tags || [],
          note: body.note || null,
          ingested_at: new Date().toISOString(),
          status: 'pending',
        };

        const artifact_id = (await sha256(body.content)).slice(0, 16);
        await env.ARTIFACTS.put(artifact_id, JSON.stringify(artifact));

        return new Response(JSON.stringify({
          success: true,
          artifact_id,
          message: 'Artifact submitted for processing',
        }), { status: 200, headers });

      } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400, headers
        });
      }
    }

    // GET /artifacts - list all
    if (url.pathname === '/artifacts' && request.method === 'GET') {
      try {
        const list = await env.ARTIFACTS.list({ limit: 100 });
        const artifacts = await Promise.all(
          list.keys.map(async (key) => {
            const value = await env.ARTIFACTS.get(key.name);
            return { id: key.name, ...JSON.parse(value || '{}') };
          })
        );
        return new Response(JSON.stringify({ count: artifacts.length, artifacts }), {
          status: 200, headers
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to fetch artifacts' }), {
          status: 500, headers
        });
      }
    }

    // GET /artifact/:id - get single
    if (url.pathname.startsWith('/artifact/') && request.method === 'GET') {
      const id = url.pathname.split('/')[2];
      const value = await env.ARTIFACTS.get(id);
      if (!value) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
      }
      return new Response(JSON.stringify({ id, ...JSON.parse(value) }), { status: 200, headers });
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'r2agi-api' }), {
        status: 200, headers
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
  }
};

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await context.request.json();

    if (!body.kind || !body.content) {
      return new Response(JSON.stringify({ error: 'Missing required fields: kind, content' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
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
    };

    const artifact_id = await sha256(body.content);
    
    // Store in KV (if binding exists)
    if (context.env.ARTIFACTS) {
      await context.env.ARTIFACTS.put(artifact_id, JSON.stringify(artifact));
    }

    return new Response(JSON.stringify({
      success: true,
      artifact_id,
      message: 'Artifact submitted for processing',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

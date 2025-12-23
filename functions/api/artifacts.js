export async function onRequestGet(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    if (!context.env.ARTIFACTS) {
      return new Response(JSON.stringify({ 
        error: 'Storage not configured',
        artifacts: [] 
      }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    const list = await context.env.ARTIFACTS.list({ limit: 100 });
    const artifacts = await Promise.all(
      list.keys.map(async (key) => {
        const value = await context.env.ARTIFACTS.get(key.name);
        return {
          id: key.name,
          ...JSON.parse(value || '{}'),
        };
      })
    );

    return new Response(JSON.stringify({ 
      count: artifacts.length,
      artifacts 
    }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch artifacts' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

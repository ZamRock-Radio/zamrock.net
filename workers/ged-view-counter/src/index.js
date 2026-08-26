export default {
  async scheduled(event, env) {
    await runCountingLogic(env);
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    // Manual trigger: /?fire=true
    if (url.searchParams.get('fire') === 'true') {
      await runCountingLogic(env);
    }

    const allTime = await env.GED_VIEWS.get('allTime') || '0';
    const todayUniqueIPs = await env.GED_VIEWS.get('todayUniqueIPs') || '0';
    const todayRequests = await env.GED_VIEWS.get('todayRequests') || '0';
    const lastRun = await env.GED_VIEWS.get('lastRun') || 'never';

    return new Response(JSON.stringify({
      allTime: parseInt(allTime, 10),
      todayUniqueIPs: parseInt(todayUniqueIPs, 10),
      todayRequests: parseInt(todayRequests, 10),
      lastRun,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=0',
      },
    });
  },
};

async function runCountingLogic(env) {
  const now = new Date();
  const lastCount = await env.GED_VIEWS.get('count');

  const yesterday = getDateNDaysAgo(1);
  const today = getDateNDaysAgo(0);

  const query = `{
    viewer {
      zones(filter: { zoneTag: "${env.ZONE_ID}" }) {
        httpRequests1dGroups(
          filter: { date_geq: "${yesterday}", date_leq: "${today}" }
          limit: 2
        ) {
          dimensions { date }
          uniq { uniques }
          sum { requests }
        }
      }
    }
  }`;

  const resp = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const data = await resp.json();
  const groups = data?.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];

  // Sum unique IPs across yesterday + today (deduplicated by CF)
  let uniqueIPs = 0;
  let requests = 0;
  for (const g of groups) {
    uniqueIPs += g?.uniq?.uniques || 0;
    requests += g?.sum?.requests || 0;
  }

  // Accumulate all-time total
  let allTime = parseInt(await env.GED_VIEWS.get('allTime') || '0', 10);

  if (lastCount !== null) {
    const prevViews = parseInt(lastCount, 10);
    if (uniqueIPs > prevViews) {
      allTime += (uniqueIPs - prevViews);
    }
  } else {
    // First run — seed with current count
    allTime = uniqueIPs;
  }

  // Only write if something changed
  const currentAllTime = parseInt(await env.GED_VIEWS.get('allTime') || '0', 10);
  if (allTime !== currentAllTime || lastCount !== String(uniqueIPs)) {
    await env.GED_VIEWS.put('allTime', String(allTime));
    await env.GED_VIEWS.put('count', String(uniqueIPs));
    await env.GED_VIEWS.put('todayDate', today);
    await env.GED_VIEWS.put('todayUniqueIPs', String(uniqueIPs));
    await env.GED_VIEWS.put('todayRequests', String(requests));
    await env.GED_VIEWS.put('lastRun', now.toISOString());
  }
}

function getDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

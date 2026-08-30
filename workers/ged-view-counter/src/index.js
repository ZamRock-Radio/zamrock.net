let todayCache = { ts: 0, visits: 0, requests: 0 };

export default {
  async scheduled(event, env) {
    await runCountingLogic(env);
    todayCache.ts = 0;
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    // Manual trigger: /?fire=true
    if (url.searchParams.get('fire') === 'true') {
      await runCountingLogic(env);
      todayCache.ts = 0;
    }

    const allTime = parseInt(await env.GED_VIEWS.get('allTime') || '0', 10);
    const allTimeRequests = parseInt(await env.GED_VIEWS.get('allTimeRequests') || '0', 10);
    const lastRun = await env.GED_VIEWS.get('lastRun') || 'never';

    // Live today's count straight from Cloudflare Analytics (NOT KV) —
    // no writes, just a read query, in-memory cached ~60s so we don't hammer the API.
    const now = Date.now();
    if (now - todayCache.ts > 60000) {
      try {
        const today = getDateNDaysAgo(0);
        const tEnd = `${getDateNDaysAgo(-1)}T00:00:00Z`;
        const live = await queryGedVisitsDetailed(env, `${today}T00:00:00Z`, tEnd);
        todayCache = { ts: now, visits: live.visits, requests: live.requests };
      } catch (e) {
        // Analytics hiccup — serve the last cached values rather than failing.
      }
    }

    return new Response(JSON.stringify({
      allTime,
      allTimeRequests,
      todayVisits: todayCache.visits,
      todayRequests: todayCache.requests,
      totalVisits: allTime + todayCache.visits,
      totalRequests: allTimeRequests + todayCache.requests,
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
  const today = getDateNDaysAgo(0);
  const yesterday = getDateNDaysAgo(1);

  // Query yesterday's FINAL unique visitor count (day is complete, no more new visitors)
  // and today's running count. Only accumulate when yesterday's number is new.
  let yesterdayVisits = 0;
  let todayVisits = 0;
  let todayRequests = 0;

  const yStart = `${yesterday}T00:00:00Z`;
  const yEnd = `${today}T00:00:00Z`;

  // Today (running)
  const tEnd = `${getDateNDaysAgo(-1)}T00:00:00Z`;
  const todayResult = await queryGedVisitsDetailed(env, `${today}T00:00:00Z`, tEnd);
  todayVisits = todayResult.visits;
  todayRequests = todayResult.requests;

  // Accumulate: only add yesterday's count if we haven't already
  let allTime = parseInt(await env.GED_VIEWS.get('allTime') || '0', 10);
  let allTimeRequests = parseInt(await env.GED_VIEWS.get('allTimeRequests') || '0', 10);
  const lastAccumulatedDate = await env.GED_VIEWS.get('lastAccumulatedDate');

  // Query yesterday's total requests for accumulation
  let yesterdayRequests = 0;
  if (lastAccumulatedDate !== yesterday) {
    const yResult = await queryGedVisitsDetailed(env, yStart, yEnd);
    yesterdayVisits = yResult.visits;
    yesterdayRequests = yResult.requests;
    allTime += yesterdayVisits;
    allTimeRequests += yesterdayRequests;
    await env.GED_VIEWS.put('lastAccumulatedDate', yesterday);
  }

  // Always update today's snapshot
  await env.GED_VIEWS.put('allTime', String(allTime));
  await env.GED_VIEWS.put('allTimeRequests', String(allTimeRequests));
  await env.GED_VIEWS.put('todayVisits', String(todayVisits));
  await env.GED_VIEWS.put('todayRequests', String(todayRequests));
  await env.GED_VIEWS.put('lastRun', now.toISOString());
}

async function queryGedVisits(env, start, end) {
  const result = await queryGedVisitsDetailed(env, start, end);
  return result.visits;
}

async function queryGedVisitsDetailed(env, start, end) {
  const query = `{
    viewer {
      zones(filter: { zoneTag: "${env.ZONE_ID}" }) {
        httpRequestsAdaptiveGroups(
          filter: {
            datetime_geq: "${start}",
            datetime_lt: "${end}",
            clientRequestPath_like: "/ged%"
          },
          limit: 100
        ) {
          count
          sum { visits }
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
  const groups = data?.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];

  let visits = 0;
  let requests = 0;
  for (const g of groups) {
    visits += g?.sum?.visits || 0;
    requests += g?.count || 0;
  }

  return { visits, requests };
}

function getDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

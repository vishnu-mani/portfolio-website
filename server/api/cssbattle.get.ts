/**
 * Live CSSBattle standing for the profile at cssbattle.dev/player/robocoder.
 *
 * cssbattle.dev has no documented API; its own player page calls this public,
 * unauthenticated Cloud Function. We proxy it server-side for two reasons:
 * it sends no CORS headers (so the browser cannot call it directly), and the
 * response is cached here so visitors don't each hit their function.
 *
 * Shape: { rank, playedCount, totalPlayers, score }
 */
const ENDPOINT = 'https://us-central1-cssbattleapp.cloudfunctions.net/getRank'
const USER_ID = 'OvlgTv6g4aady9h7A5PgrT6VXuI3'

type RankResponse = {
  rank?: number
  playedCount?: number
  totalPlayers?: number
  score?: number
}

export default defineCachedEventHandler(
  async () => {
    try {
      const data = await $fetch<RankResponse>(ENDPOINT, {
        query: { userId: USER_ID },
        timeout: 6000,
        retry: 1,
      })

      if (typeof data?.rank !== 'number') throw new Error('unexpected payload')

      return {
        ok: true as const,
        rank: data.rank,
        targetsPlayed: data.playedCount ?? null,
        totalPlayers: data.totalPlayers ?? null,
        score: typeof data.score === 'number' ? Math.round(data.score) : null,
        fetchedAt: new Date().toISOString(),
      }
    } catch {
      // Throw rather than return a failure object: defineCachedEventHandler
      // caches whatever is RETURNED, so a returned error would pin the outage
      // in cache for a full hour. A thrown error is not cached, and the client
      // simply falls back to the last known static value.
      throw createError({ statusCode: 502, statusMessage: 'cssbattle upstream unavailable' })
    }
  },
  {
    name: 'cssbattle-rank',
    maxAge: 60 * 60, // 1 hour
    swr: true,
  },
)

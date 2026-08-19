import { createFileRoute, Link } from "@tanstack/react-router";
import { formatTime } from "@/game/config";
import { MOCK_ACTIVITY, MOCK_ANALYTICS, MOCK_LEADERBOARD } from "@/services/mockData";

const title = "Control Room — TECHFEST AR-VR Hunt";
const description =
  "Organizer dashboard: live player progress, activity feed and level analytics for the hunt.";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const active = MOCK_LEADERBOARD.filter((p) => p.status !== "completed").length;
  const completed = MOCK_LEADERBOARD.length - active;
  const avgPenalty = Math.round(
    MOCK_LEADERBOARD.reduce((a, p) => a + p.penaltySeconds, 0) / MOCK_LEADERBOARD.length,
  );

  return (
    <main className="holo-grid min-h-dvh bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-[10px] tracking-[0.4em] text-primary">ORGANIZERS</p>
            <h1 className="mt-2 text-3xl text-foreground text-glow">CONTROL ROOM</h1>
          </div>
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
            ← Back to base
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <Kpi label="Registered" value={String(MOCK_LEADERBOARD.length)} />
          <Kpi label="In progress" value={String(active)} />
          <Kpi label="Completed" value={String(completed)} />
          <Kpi label="Avg penalty" value={`${avgPenalty}s`} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="holo-panel rounded-xl p-5">
            <h2 className="font-display text-sm tracking-widest text-primary">PLAYER PROGRESS</h2>
            <div className="mt-4 space-y-3">
              {MOCK_LEADERBOARD.map((p) => (
                <div
                  key={p.playerId}
                  className="rounded-md border border-border/60 bg-background/40 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-foreground">{p.playerName}</span>
                    <span className="font-display text-[11px] text-primary">
                      {formatTime(p.finalTimeSeconds)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/50">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(p.level / 10) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-muted-foreground">
                    <span>
                      Level {p.level}/10 · {p.location}
                    </span>
                    <span className="uppercase tracking-widest">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="holo-panel rounded-xl p-5">
            <h2 className="font-display text-sm tracking-widest text-primary">LIVE ACTIVITY</h2>
            <ul className="mt-4 space-y-2">
              {MOCK_ACTIVITY.map((a) => (
                <li key={a.id} className="text-xs text-muted-foreground">
                  <span className="text-foreground/90">{a.playerName}</span> {a.message}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="holo-panel mt-6 rounded-xl p-5">
          <h2 className="font-display text-sm tracking-widest text-primary">LEVEL ANALYTICS</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="px-3 py-2 font-normal">Level</th>
                  <th className="px-3 py-2 font-normal">Avg time</th>
                  <th className="px-3 py-2 font-normal">Avg penalty</th>
                  <th className="px-3 py-2 font-normal">Success rate</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ANALYTICS.perLevel.map((l) => (
                  <tr key={l.level} className="border-b border-border/40 last:border-0">
                    <td className="px-3 py-2 font-display text-primary">{l.level}</td>
                    <td className="px-3 py-2">{formatTime(l.avgTime)}</td>
                    <td className="px-3 py-2 text-destructive">+{l.avgPenalty}s</td>
                    <td className="px-3 py-2">{l.successRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="holo-panel rounded-lg p-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl text-primary">{value}</p>
    </div>
  );
}
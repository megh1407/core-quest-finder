import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatTime } from "@/game/config";
import { api } from "@/services/gameApi";

const title = "Leaderboard — TECHFEST AR-VR Hunt";
const description =
  "Live standings for the TECHFEST virtual treasure hunt, ranked by game time plus penalties.";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => api.getLeaderboard(),
  });

  return (
    <main className="holo-grid min-h-dvh bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-[10px] tracking-[0.4em] text-primary">STANDINGS</p>
            <h1 className="mt-2 text-3xl text-foreground text-glow">LEADERBOARD</h1>
          </div>
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
            ← Back to base
          </Link>
        </div>

        <div className="holo-panel mt-8 overflow-x-auto rounded-xl">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-[10px] uppercase tracking-widest text-muted-foreground">
                <Th>#</Th>
                <Th>Operative</Th>
                <Th>Team</Th>
                <Th>Level</Th>
                <Th>Time</Th>
                <Th>Penalty</Th>
                <Th>Final</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Syncing standings…
                  </td>
                </tr>
              )}
              {data.map((row) => (
                <tr key={row.playerId} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-display text-primary">{row.rank}</td>
                  <td className="px-4 py-3 text-foreground">{row.playerName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.team}</td>
                  <td className="px-4 py-3 text-muted-foreground">L{row.level}</td>
                  <td className="px-4 py-3 font-display text-xs">{formatTime(row.timeSeconds)}</td>
                  <td className="px-4 py-3 text-xs text-destructive">+{row.penaltySeconds}s</td>
                  <td className="px-4 py-3 font-display text-xs text-primary">
                    {formatTime(row.finalTimeSeconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Ranked by final time (game time + penalties). Data served by the mock mission API.
        </p>
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-normal">{children}</th>;
}
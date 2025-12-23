mkdir -p app/games/[date]
cat > app/games/[date]/page.tsx << 'EOF'
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

function parseDateParam(dateParam: string) {
  const [y, m, d] = dateParam.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

function dayRangeUTC(dateParam: string) {
  const p = parseDateParam(dateParam);
  if (!p) throw new Error("Invalid date format (use YYYY-MM-DD).");
  const start = new Date(Date.UTC(p.y, p.m - 1, p.d, 0, 0, 0));
  const end = new Date(Date.UTC(p.y, p.m - 1, p.d + 1, 0, 0, 0));
  return { start, end };
}

function statusLabel(status: string, homeScore?: number | null, awayScore?: number | null) {
  if (status === "FINAL") return "Final";
  if (status === "IN_PROGRESS") return "Live";
  if (status === "CANCELED") return "Canceled";
  if (status === "POSTPONED") return "Postponed";
  if (homeScore != null || awayScore != null) return "In progress";
  return "Scheduled";
}

export default async function GamesByDatePage({
  params,
}: {
  params: { date: string };
}) {
  const { start, end } = dayRangeUTC(params.date);

  const games = await prisma.game.findMany({
    where: { dateTime: { gte: start, lt: end } },
    orderBy: { dateTime: "asc" },
    include: { homeTeam: true, awayTeam: true },
  });

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Games</h1>
          <p style={{ marginTop: 8, opacity: 0.8 }}>{params.date}</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/games/${params.date}`} style={{ textDecoration: "none" }}>
            <span style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10, display: "inline-block" }}>
              Refresh
            </span>
          </Link>

          <form action={`/api/ingest/${params.date}`} method="post" style={{ display: "inline" }}>
            <button
              type="submit"
              style={{
                padding: "10px 12px",
                border: "1px solid #111",
                borderRadius: 10,
                background: "#111",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Re-ingest this date
            </button>
          </form>
        </div>
      </header>

      <section style={{ marginTop: 20 }}>
        {games.length === 0 ? (
          <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 14 }}>
            <p style={{ margin: 0 }}>No games found for this date in your database.</p>
            <p style={{ marginTop: 8, opacity: 0.8 }}>
              Click <b>Re-ingest this date</b> to pull the schedule into Neon.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {games.map((g) => {
              const label = statusLabel(g.status, g.homeScore, g.awayScore);
              const time = new Date(g.dateTime).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              });

              const awayWon =
                g.status === "FINAL" &&
                g.awayScore != null &&
                g.homeScore != null &&
                g.awayScore > g.homeScore;

              const homeWon =
                g.status === "FINAL" &&
                g.awayScore != null &&
                g.homeScore != null &&
                g.homeScore > g.awayScore;

              return (
                <div
                  key={g.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 14,
                    padding: 14,
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, padding: "3px 8px", border: "1px solid #ddd", borderRadius: 999 }}>
                        {label}
                      </span>
                      <span style={{ fontSize: 13, opacity: 0.8 }}>{time}</span>
                    </div>

                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
                        <span style={{ fontWeight: awayWon ? 800 : 600 }}>{g.awayTeam.name}</span>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>{g.awayScore ?? "—"}</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
                        <span style={{ fontWeight: homeWon ? 800 : 600 }}>{g.homeTeam.name}</span>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>{g.homeScore ?? "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", opacity: 0.85, fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>Win %</div>
                    <div>—</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
EOF

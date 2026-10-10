import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Overview() {
  const { user } = useAuth();
  const [endpoints, setEndpoints] = useState([]);
  const [events, setEvents] = useState([]);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [epRes, evRes] = await Promise.all([
          api.get("/endpoints"),
          api.get("/events"),
        ]);
        setEndpoints(epRes.data);
        setEvents(evRes.data);
      } catch (err) {
        setFailed(true);
        toast.error(err.response?.data?.error || "Failed to load overview");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeCount = endpoints.filter((e) => e.active).length;
  const pausedCount = endpoints.length - activeCount;

  const stats = [
    { label: "Total endpoints", value: endpoints.length },
    { label: "Active endpoints", value: activeCount },
    { label: "Paused endpoints", value: pausedCount },
    { label: "Total events", value: events.length },
  ];

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold tracking-tight mb-1">Overview</h1>
      <p className="text-sm text-subtle mb-8">
        Welcome back, {user?.username}. Here&apos;s what&apos;s happening in
        your Hookshot account.
      </p>

      {loading && <p className="text-muted text-sm">Loading…</p>}

      {!loading && !failed && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((s) => (
              <div
                key={s.label}
                className="p-6 rounded-2xl bg-panel border border-line card-hover"
              >
                <p className="text-sm text-subtle">{s.label}</p>
                <p className="text-4xl font-bold mt-2">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
              <div className="flex items-center justify-between mb-4 ">
                <h2 className="text-base font-semibold">
                  Recent events{" "}
                  <span className="text-subtle font-normal">
                    ({events.length})
                  </span>
                </h2>
                <Link
                  to="/events"
                  className="text-sm text-accent underline underline-offset-4"
                >
                  Send an event
                </Link>
              </div>

              <div className="space-y-3 max-h-144 overflow-y-auto pr-1 py-1">
                {events.length === 0 && (
                  <p className="text-sm text-subtle">
                    No events yet. Send one from the Events page.
                  </p>
                )}
                {events.map((ev) => (
                  <div
                    key={ev._id}
                    className="p-4 rounded-xl bg-panel border border-line card-hover"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-accent">
                        {ev.type}
                      </p>
                      <p className="text-xs text-subtle">
                        {new Date(ev.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs text-subtle mt-1">
                      {ev.endpointIds.length} endpoint
                      {ev.endpointIds.length === 1 ? "" : "s"} · key:{" "}
                      <span className="font-mono">{ev.idempotencyKey}</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Your endpoints</h2>
                <Link
                  to="/endpoints"
                  className="text-sm text-accent underline underline-offset-4"
                >
                  Manage
                </Link>
              </div>

              <div className="space-y-3 max-h-144 overflow-y-auto pr-1 py-1">
                {endpoints.length === 0 && (
                  <p className="text-sm text-subtle">
                    No endpoints yet. Add your first one on the Endpoints page.
                  </p>
                )}
                {endpoints.map((ep) => (
                  <div
                    key={ep._id}
                    className="flex items-center justify-between gap-3 p-4 rounded-xl bg-panel border border-line card-hover"
                  >
                    <p className="text-sm break-all">{ep.url}</p>
                    <span
                      className={`shrink-0 px-2.5 py-0.5 rounded-full border text-xs ${
                        ep.active
                          ? "border-ok/40 text-ok"
                          : "border-edge text-subtle"
                      }`}
                    >
                      {ep.active ? "Active" : "Paused"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

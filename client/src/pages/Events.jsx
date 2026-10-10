import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [type, setType] = useState("invoice.paid");
  const [dataText, setDataText] = useState('{ "amount": 499 }');
  const [key, setKey] = useState(() => crypto.randomUUID());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/events");
      setEvents(data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();

    let data;
    try {
      data = JSON.parse(dataText || "{}");
    } catch {
      toast.error("Data must be valid JSON");
      return;
    }

    setSending(true);
    try {
      const res = await api.post(
        "/events",
        { type, data },
        { headers: { "Idempotency-Key": key } }
      );
      if (res.status === 201) {
        toast.success("Event created (201)");
      } else {
        toast(
          "Duplicate key: returned the existing event (200). Nothing new saved.",
          { icon: "♻️" }
        );
      }
      await load();
    } catch (err) {
      if (err.response?.status === 429) {
        const wait = err.response.headers["retry-after"];
        toast.error(
          wait
            ? `Too many requests. Try again in ${wait}s.`
            : "Too many requests. Try again shortly."
        );
      } else {
        toast.error(err.response?.data?.error || "Could not send event");
      }
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-field text-neutral-900 placeholder-neutral-500 text-sm outline-none border border-fieldline focus:border-pink-600 transition-colors";

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Events</h1>
      <p className="text-sm text-subtle mb-6">
        Your latest 50 events, newest first.
      </p>

      <form
        onSubmit={handleSend}
        className="p-4 rounded-xl bg-panel border border-line space-y-3 card-hover"
      >
        <p className="text-sm font-medium">Send a test event</p>
        <input
          type="text"
          placeholder="Event type, e.g. invoice.paid"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className={inputClass}
        />
        <textarea
          rows={3}
          placeholder="Data (JSON)"
          value={dataText}
          onChange={(e) => setDataText(e.target.value)}
          className={`${inputClass} font-mono`}
        />
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Idempotency key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            className={`${inputClass} font-mono`}
          />
          <button
            type="button"
            onClick={() => setKey(crypto.randomUUID())}
            className="px-4 rounded-lg text-sm text-muted border border-edge hover:bg-hover whitespace-nowrap"
          >
            New key
          </button>
        </div>
        <button
          type="submit"
          disabled={sending}
          className="px-5 py-2.5 rounded-lg text-grad-text font-semibold text-sm bg-linear-to-r from-grad-from to-grad-to hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {sending ? "Sending…" : "Send event"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-muted text-sm">Loading…</p>}

        {!loading && events.length === 0 && (
          <p className="text-subtle text-sm">No events yet.</p>
        )}

        {events.map((ev) => (
          <div
            key={ev._id}
            className="p-4 rounded-xl bg-panel border border-line"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-accent">{ev.type}</p>
              <p className="text-xs text-subtle">
                {new Date(ev.createdAt).toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-subtle mt-1">
              {ev.endpointIds.length} endpoint
              {ev.endpointIds.length === 1 ? "" : "s"} · key:{" "}
              <span className="font-mono">{ev.idempotencyKey}</span>
            </p>
            <pre className="mt-2 text-xs text-muted bg-inset rounded-lg p-3 overflow-x-auto">
              {JSON.stringify(ev.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

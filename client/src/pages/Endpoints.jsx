import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Endpoints() {
  const [endpoints, setEndpoints] = useState([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/endpoints");
        setEndpoints(data);
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to load endpoints");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const replace = (updated) =>
    setEndpoints((list) =>
      list.map((e) => (e._id === updated._id ? updated : e))
    );

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const { data } = await api.post("/endpoints", { url });
      setEndpoints((list) => [data, ...list]);
      setUrl("");
      toast.success("Endpoint added");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not add endpoint");
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (ep) => {
    try {
      const { data } = await api.patch(`/endpoints/${ep._id}`, {
        active: !ep.active,
      });
      replace(data);
      toast.success(data.active ? "Endpoint activated" : "Endpoint paused");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  const saveEdit = async (id) => {
    try {
      const { data } = await api.patch(`/endpoints/${id}`, { url: editUrl });
      replace(data);
      setEditingId(null);
      toast.success("Endpoint updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this endpoint?")) return;
    try {
      await api.delete(`/endpoints/${id}`);
      setEndpoints((list) => list.filter((e) => e._id !== id));
      toast.success("Endpoint deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  const inputClass =
    "flex-1 px-4 py-3 rounded-lg bg-field text-neutral-900 placeholder-neutral-500 text-sm outline-none border border-fieldline focus:border-pink-600 transition-colors";

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Endpoints</h1>
      <p className="text-sm text-subtle mb-6">
        Where Hookshot will deliver your events.
      </p>

      <form onSubmit={handleAdd} className="flex gap-3 mb-2">
        <input
          type="text"
          placeholder="https://example.com/webhook"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className={inputClass}
        />
        <button
          type="submit"
          disabled={adding}
          className="px-5 rounded-lg text-grad-text font-semibold text-sm bg-linear-to-r from-grad-from to-grad-to hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-muted text-sm">Loading…</p>}

        {!loading && endpoints.length === 0 && (
          <p className="text-subtle text-sm">
            No endpoints yet. Add your first one above.
          </p>
        )}

        {endpoints.map((ep) => (
          <div
            key={ep._id}
            className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-xl bg-panel border border-line card-hover"
          >
            {editingId === ep._id ? (
              <input
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className={inputClass}
                autoFocus
              />
            ) : (
              <p className="flex-1 text-sm break-all">{ep.url}</p>
            )}

            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => toggleActive(ep)}
                className={`px-3 py-1 rounded-full border ${
                  ep.active ? "border-ok/40 text-ok" : "border-edge text-subtle"
                }`}
              >
                {ep.active ? "Active" : "Paused"}
              </button>

              {editingId === ep._id ? (
                <>
                  <button
                    onClick={() => saveEdit(ep._id)}
                    className="text-accent"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-muted"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(ep._id);
                    setEditUrl(ep.url);
                  }}
                  className="text-muted hover:text-fg"
                >
                  Edit
                </button>
              )}

              <button onClick={() => remove(ep._id)} className="text-bad">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

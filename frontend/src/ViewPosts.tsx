import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

export async function fetchPosts() {
  // Build a proper URL even if VITE_API_URL is set to just "localhost:8000"
  const base = (import.meta.env.VITE_API_URL ?? "") as string;
  const origin =
    base.startsWith("http://") || base.startsWith("https://")
      ? base
      : `http://${base}`; // default to http if no scheme provided

  const url = `${origin.replace(/\/$/, "")}/api/posts`;

  const res = await fetch(url, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export default function ViewPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchPosts()
      .then((data) => {
        if (!mounted) return;
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading…</div>;
  if (error) return <div role="alert">Error: {error}</div>;

  return (
    <div>
      <h1>Posts</h1>
      {posts.map((m) => (
        <div key={m.id}>
          <h2>{m.title}</h2>
          <p>{m.content}</p>
        </div>
      ))}
    </div>
  );
}

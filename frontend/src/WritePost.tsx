import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export async function sendPost(title, content) {
  /* Update TypeScript backend with new message */
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Message;
}

export default function WritePost() {
  /* Compose a regular text message */
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPost(title, content);
      navigate("/posts", { replace: true });
  };
    const addDisabled = (!title || !content);

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
          <br/>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
      />
          <br/>
      <button class="btn-big" type="submit" disabled={addDisabled}>
        Post
      </button>
    </form>
  );
}

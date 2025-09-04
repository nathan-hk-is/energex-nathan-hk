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
  const res = await fetch(`${import.meta.env.VITE_API_TS_URL}/api/posts`, {
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
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPost(trimmed);
  };

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <input
        ref={inputRef1}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <input
        ref={inputRef2}
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
      />
      <button class="btn-big" type="submit" disabled={addDisabled}>
        {t("message.send_btn")}
      </button>
    </form>
  );
}

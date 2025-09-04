import express from "express";
import type { CookieOptions, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { createServer } from "http";
import { createClient } from "redis";

const prisma = new PrismaClient();
(async () => {
  try {
    await prisma.$connect();
    await prisma.$executeRaw`SELECT 1`;
    console.log("[startup] Prisma connected and probe query succeeded");
  } catch (e) {
    console.error("[startup] Prisma connection/probe failed", e);
  }
})();

const app_ts = express();
const httpServer = createServer(app_ts);
app_ts.use(express.json());

import cookieParser from "cookie-parser";
app_ts.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET; // .env
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing – add it to .env or the shell");
}

const COOKIE_OPTS: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false, // must be false on localhost without HTTPS
};

const allowedOrigins =
  process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) ?? true;

app_ts.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// --- Redis cache setup ---
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const redis = createClient({ url: REDIS_URL });
redis.on("error", (err) => console.error("[redis] error", err));
(async () => {
  try {
    await redis.connect();
    console.log("[startup] Redis connected");
  } catch (e) {
    console.error("[startup] Redis connect failed", e);
  }
})();

const POSTS_ALL_KEY = "posts:all";
const postKey = (id: number | string) => `posts:id:${id}`;
const POSTS_TTL_SECONDS = 60; // adjust as needed
// --- end Redis cache setup ---

function asyncWrap<T extends express.RequestHandler>(fn: T): T {
  // tiny helper so thrown promises go to next(err)
  return (async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      next(e as any);
    }
  }) as unknown as T;
}

app_ts.post(
  "/api/register",
  asyncWrap(async (req, res) => {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };
    if (!name || !email || !password)
      return res.status(400).send("name, email, and password required");

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.users.create({
      data: { name, email, passwordHash: hash },
    });

    res.status(201).send("Registered");
  }),
);

app_ts.post("/api/login", async (req, res) => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  if (!email || !password) {
    return res.status(400).send("email and password required");
  }

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) return res.status(401).send("Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).send("Invalid credentials");

  const token = jwt.sign(
    { sub: user.id, data: { email: user.email, name: user.name } },
    JWT_SECRET,
    { expiresIn: "12h" },
  );
  res.cookie("token", token, COOKIE_OPTS).json({ status: "Logged in", token });
});

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieToken = req.cookies?.token as string | undefined;
    const authz = req.headers.authorization;
    const headerToken =
      authz && authz.startsWith("Bearer ") ? authz.slice(7) : undefined;

    // Fallback: parse the raw Cookie header in case cookie-parser didn't populate req.cookies
    const rawCookieHeader = req.headers.cookie as string | undefined;
    const parsedHeaderToken =
      !cookieToken && rawCookieHeader
        ? rawCookieHeader.match(/(?:^|;\s*)token=([^;]+)/)?.[1]
        : undefined;

    const token = cookieToken ?? parsedHeaderToken ?? headerToken;

    if (!token) {
      return res.status(401).send("Unauthenticated");
    }

    const payload = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = payload;
    (req as any).userId = payload.sub;
    next();
  } catch (e) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true, //, sameSite: "lax", path: "/",
    });
    console.warn("[auth] verify failed:", (e as any)?.message);
    res.status(401).send("Unauthenticated");
  }
};

app_ts.get("/api/me", auth, (req, res) => {
  console.log("api me");
  res.json({
    userId: (req as any).user.sub,
    name: (req as any).user.data.name,
    email: (req as any).user.data.email,
  });
});

app_ts.get(
  "/api/posts",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cached = await redis.get(POSTS_ALL_KEY);
      if (cached) {
        // Serve from cache
        return res.json(JSON.parse(cached));
      }

      const thread = await prisma.posts.findMany({
        orderBy: { created_at: "desc" },
        include: {
          // Adjust "user" to your relation field name if different
          user: { select: { name: true } },
        },
      });

      // Add a flat `userName` field for convenience and strip the nested `user` object
      const withNames = thread.map((p) => ({
        ...p,
        userName: p.user?.name ?? null,
      }));

      // Cache the transformed result
      await redis.setEx(
        POSTS_ALL_KEY,
        POSTS_TTL_SECONDS,
        JSON.stringify(withNames),
      );

      res.json(withNames);
    } catch (err) {
      next(err);
    }
  },
);

app_ts.post(
  "/api/posts",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content } = req.body as {
        title: string;
        content: string;
      };

      const post = await prisma.posts.create({
        data: {
          title,
          content,
          user_id: (req as any).userId,
        },
      });

      // Invalidate and refresh caches
      await redis.del(POSTS_ALL_KEY);
      await redis.setEx(postKey(post.id), POSTS_TTL_SECONDS, JSON.stringify(post));

      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  },
);

app_ts.get(
  "/api/posts/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return res.status(400).send("Invalid id");
    }

    try {
      const key = postKey(numericId);
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const post = await prisma.posts.findUnique({
        where: { id: numericId },
        include: {
          // Adjust "user" to your relation field name if different
          user: { select: { name: true } },
        },
      });
      if (!post) {
        return res.status(404).send("Not found");
      }

      const shaped = { ...post, userName: post.user?.name ?? null };

      await redis.setEx(key, POSTS_TTL_SECONDS, JSON.stringify(shaped));
      res.json(shaped);
    } catch (err) {
      next(err);
    }
  },
);

app_ts.post("/api/logout", (req, res) => {
  res.clearCookie("token", COOKIE_OPTS).send("Logged out");
});

httpServer.listen(8000);

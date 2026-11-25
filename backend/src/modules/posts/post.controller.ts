import type { RequestHandler } from "express";
import { asyncHandler, requireAuthContext } from "../../lib/http.js";
import {
  communityPostsQuerySchema,
  createPostSchema,
  feedQuerySchema,
  updatePostSchema,
} from "./post.validation.js";
import {
  createPost,
  deletePost,
  getFeed,
  getPost,
  listCommunityPosts,
  updatePost,
} from "./post.service.js";

export const createPostController: RequestHandler = asyncHandler(
  async (req, res) => {
    const auth = requireAuthContext(req);
    const input = createPostSchema.parse(req.body);
    const data = await createPost(String(req.params.name ?? ""), auth, input);

    res.status(201).json({ data });
  },
);

export const getPostController: RequestHandler = asyncHandler(
  async (req, res) => {
    const data = await getPost(String(req.params.postId ?? ""), req.auth);

    res.status(200).json({ data });
  },
);

export const updatePostController: RequestHandler = asyncHandler(
  async (req, res) => {
    const auth = requireAuthContext(req);
    const input = updatePostSchema.parse(req.body);
    const data = await updatePost(String(req.params.postId ?? ""), auth, input);

    res.status(200).json({ data });
  },
);

export const deletePostController: RequestHandler = asyncHandler(
  async (req, res) => {
    const auth = requireAuthContext(req);

    await deletePost(String(req.params.postId ?? ""), auth);

    res.status(204).send();
  },
);

export const getFeedController: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = feedQuerySchema.parse(req.query);
    const result = await getFeed(query, req.auth);

    res.status(200).json(result);
  },
);

export const listCommunityPostsController: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = communityPostsQuerySchema.parse(req.query);
    const result = await listCommunityPosts(
      String(req.params.name ?? ""),
      query,
      req.auth,
    );

    res.status(200).json(result);
  },
);
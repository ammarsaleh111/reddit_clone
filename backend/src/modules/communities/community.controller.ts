import type { RequestHandler } from "express";
import { asyncHandler, requireAuthContext } from "../../lib/http.js";
import {
  createCommunitySchema,
  listCommunitiesQuerySchema,
} from "./community.validation.js";
import {
  createCommunity,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  listCommunities,
} from "./community.service.js";

export const listCommunitiesController: RequestHandler = asyncHandler(
  async (req, res) => {
    const query = listCommunitiesQuerySchema.parse(req.query);
    const result = await listCommunities(query, req.auth);

    res.status(200).json(result);
  },
);

export const createCommunityController: RequestHandler = asyncHandler(
  async (req, res) => {
    const auth = requireAuthContext(req);
    const input = createCommunitySchema.parse(req.body);
    const data = await createCommunity(auth.userId, input);

    res.status(201).json({ data });
  },
);

export const getCommunityController: RequestHandler = asyncHandler(
  async (req, res) => {
    const data = await getCommunity(String(req.params.name ?? ""), req.auth);

    res.status(200).json({ data });
  },
);

export const joinCommunityController: RequestHandler = asyncHandler(
  async (req, res) => {
    const auth = requireAuthContext(req);
    const data = await joinCommunity(String(req.params.name ?? ""), auth.userId);

    res.status(200).json({ data });
  },
);

export const leaveCommunityController: RequestHandler = asyncHandler(
  async (req, res) => {
    const auth = requireAuthContext(req);
    const data = await leaveCommunity(String(req.params.name ?? ""), auth.userId);

    res.status(200).json({ data });
  },
);
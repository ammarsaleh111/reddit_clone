
import type { Request, Response } from "express";
import { AppError } from "../../lib/AppError.js";

import {
  createCommentSchema,
  updateCommentSchema,
  commentIdSchema,
  postIdSchema,
  paginationSchema,
} from "./comment.validation.js";

import {
  createComment,
  getPostComments,
  getCommentReplies,
  getCommentById,
  updateComment,
  deleteComment,
} from "./comment.service.js";

// POST: Create a comment or reply
export async function createCommentController(
  req: Request,
  res: Response
) {
  if (!req.auth) {
    throw new AppError(401, "Authentication required");
  }

  const input = createCommentSchema.parse(req.body);

  const comment = await createComment({
    authorId: req.auth.userId,
    postId: input.post,
    content: input.content,
    parentId: input.parent,
  });

  res.status(201).json({
    success: true,
    data: { comment },
  });
}

// GET: Get comments belonging to a post
export async function getPostCommentsController(
  req: Request,
  res: Response
) {
  const { postId } = postIdSchema.parse(req.params);
  const pagination = paginationSchema.parse(req.query);

  const result = await getPostComments(postId, pagination);

  res.status(200).json({
    success: true,
    data: result,
  });
}

// GET: Get replies belonging to a comment
export async function getCommentRepliesController(
  req: Request,
  res: Response
) {
  const { id } = commentIdSchema.parse(req.params);
  const pagination = paginationSchema.parse(req.query);

  const result = await getCommentReplies(id, pagination);

  res.status(200).json({
    success: true,
    data: result,
  });
}

// GET: Get one comment
export async function getCommentController(
  req: Request,
  res: Response
) {
  const { id } = commentIdSchema.parse(req.params);

  const comment = await getCommentById(id);

  res.status(200).json({
    success: true,
    data: { comment },
  });
}

// PATCH: Edit your own comment
export async function updateCommentController(
  req: Request,
  res: Response
) {
  if (!req.auth) {
    throw new AppError(401, "Authentication required");
  }

  const { id } = commentIdSchema.parse(req.params);
  const input = updateCommentSchema.parse(req.body);

  const comment = await updateComment(
    id,
    req.auth.userId,
    input.content
  );

  res.status(200).json({
    success: true,
    data: { comment },
  });
}

// DELETE: Delete your own comment
export async function deleteCommentController(
  req: Request,
  res: Response
) {
  if (!req.auth) {
    throw new AppError(401, "Authentication required");
  }

  const { id } = commentIdSchema.parse(req.params);

  await deleteComment(id, req.auth.userId);

  res.status(204).send();
}

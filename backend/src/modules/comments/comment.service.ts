
import { Comment } from "../../models/Comment.js";
import { Post } from "../../models/Post.js";
import { Community } from "../../models/Community.js";
import { AppError } from "../../lib/AppError.js";

interface CreateCommentInput {
  authorId: string;
  postId: string;
  content: string;
  parentId?: string;
}

interface PaginationInput {
  page: number;
  limit: number;
}

export async function createComment(
  input: CreateCommentInput
) {
  const { authorId, postId, content, parentId } = input;

  const post = await Post.findOne({
    _id: postId,
    deletedAt: null,
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  if (parentId) {
    const parentComment = await Comment.findOne({
      _id: parentId,
      post: postId,
      deletedAt: null,
    });

    if (!parentComment) {
      throw new AppError(
        404,
        "Parent comment not found for this post"
      );
    }
  }

  return Comment.create({
    author: authorId,
    post: postId,
    parent: parentId ?? null,
    content,
  });
}

// Get top-level comments belonging to a post
export async function getPostComments(
  postId: string,
  pagination: PaginationInput
) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const post = await Post.findOne({
    _id: postId,
    deletedAt: null,
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  const [comments, total] = await Promise.all([
    Comment.find({
      post: postId,
      parent: null,
      deletedAt: null,
    })
      .sort({ createdAt: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username"),

    Comment.countDocuments({
      post: postId,
      parent: null,
      deletedAt: null,
    }),
  ]);

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get replies belonging to a comment
export async function getCommentReplies(
  commentId: string,
  pagination: PaginationInput
) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const parentComment = await Comment.findOne({
    _id: commentId,
    deletedAt: null,
  });

  if (!parentComment) {
    throw new AppError(404, "Comment not found");
  }

  const [replies, total] = await Promise.all([
    Comment.find({
      parent: commentId,
      deletedAt: null,
    })
      .sort({ createdAt: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username"),

    Comment.countDocuments({
      parent: commentId,
      deletedAt: null,
    }),
  ]);

  return {
    replies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get one comment
export async function getCommentById(commentId: string) {
  const comment = await Comment.findOne({
    _id: commentId,
    deletedAt: null,
  }).populate("author", "username");

  if (!comment) {
    throw new AppError(404, "Comment not found");
  }

  return comment;
}

// Edit a comment
export async function updateComment(
  commentId: string,
  userId: string,
  content: string
) {
  const comment = await Comment.findOne({
    _id: commentId,
    author: userId,
    deletedAt: null,
  });

  if (!comment) {
    throw new AppError(
      404,
      "Comment not found or you are not its author"
    );
  }

  comment.content = content;
  await comment.save();

  return comment;
}

// Soft-delete a comment
export async function deleteComment(commentId: string, userId: string) {
  const comment = await Comment.findOne({
    _id: commentId,
    deletedAt: null,
  });

  if (!comment) {
    throw new AppError(404, "Comment not found");
  }

  const isCommentAuthor = comment.author.toString() === userId;
  if (!isCommentAuthor) {
    const post = await Post.findOne({
      _id: comment.post,
      deletedAt: null,
    }).select("community");

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    const community = await Community.findOne({
      _id: post.community,
    }).select("creator");

    if (!community) {
      throw new AppError(404, "Community not found");
    }

    const isCommunityCreator = community.creator.toString() === userId;

    if (!isCommunityCreator) {
      throw new AppError(
        403,
        "You are not allowed to delete this comment",
      );
    }
  }
  comment.deletedAt = new Date();

  await comment.save();
}
export type TVote = {
  articleId: string; // Reference to article ID
  userId: string; // Reference to User ID
  type: 'upvote' | 'downvote';
};

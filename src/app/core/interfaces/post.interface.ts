import { User } from './user.interface';

export interface Post {
  _id: string;
  body?: string;
  image?: string;
  privacy: string;
  user: User;
  sharedPost: null;
  likes: any[];
  topcomment: null;
  isShare: boolean;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  id: string;
  bookmarked: boolean;
}

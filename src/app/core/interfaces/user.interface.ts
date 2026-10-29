
export interface User {
  _id: string;
  name: string;
  username: string;
  email?: string;
  photo: string;
  cover?: string;
  followersCount?: number;
  mutualFollowersCount?: number;
}

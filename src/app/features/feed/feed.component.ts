import { isPlatformBrowser } from '@angular/common';
import {afterNextRender,Component,computed,inject,PLATFORM_ID,signal,
} from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/interfaces/post.interface';
import { PostComponent } from '../../shared/post/post.component';
import { CreatepostComponent } from './createpost/createpost.component';
import { SuggestedFriendsComponent } from './suggested-friends/suggested-friends.component';

@Component({
  selector: 'app-feed',
  imports: [PostComponent, CreatepostComponent,SuggestedFriendsComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent {
  private readonly authService = inject(AuthService);
  private readonly postService = inject(PostService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly userData = this.authService.userData;

  readonly AllPosts = signal<Post[]>([]);

  readonly activeSection = signal<
    'feed' | 'my-posts' | 'community' | 'saved'
  >('feed');

  readonly displayedPosts = computed(() => {
    const posts = this.AllPosts();
    const section = this.activeSection();
    const currentUserId = this.userData()?._id;

    switch (section) {
      case 'my-posts':
        return posts.filter(
          post => post.user?._id === currentUserId
        );

      case 'community':
        return posts.filter(
          post => post.user?._id !== currentUserId
        );

      case 'saved':
        return posts.filter(
          post => post.bookmarked === true
        );

      default:
        return posts;
    }
  });

  constructor() {
    afterNextRender(() => {
      this.loadPosts();
    });
  }

  loadPosts(): void {
    if (!this.isBrowser) return;

    this.postService.getAllPosts().subscribe({
      next: (res: any) => {
        this.AllPosts.set(res?.data?.posts ?? []);
      },
      error: (err) => {
        console.error('Posts error:', err);
      },
    });
  }

  removePost(postId: string): void {
    this.AllPosts.update(posts =>
      posts.filter(post => post._id !== postId)
    );
  }

  changeSection(
    section: 'feed' | 'my-posts' | 'community' | 'saved'
  ): void {
    this.activeSection.set(section);
  }
}

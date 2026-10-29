
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ProfileService } from '../../core/services/profile.service';
import { PostService } from '../../core/services/post.service';

import { Profile } from '../../core/interfaces/profile.interface';
import { Post } from '../../core/interfaces/post.interface';

@Component({
  selector: 'app-profile',
  imports: [DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly postService = inject(PostService);

  user = signal<Profile | null>(null);

  posts = signal<Post[]>([]);
  savedPosts = signal<Post[]>([]);

  activeTab = signal<'posts' | 'saved'>('posts');

  isLoading = signal(true);
  isPostsLoading = signal(true);
  isSavedPostsLoading = signal(false);

  errorMessage = signal('');
  postsErrorMessage = signal('');
  savedPostsErrorMessage = signal('');

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.postsErrorMessage.set('');
    this.isPostsLoading.set(true);

    this.profileService.getMyProfile().subscribe({
      next: (response) => {
        this.user.set(response.data.user);
        this.isLoading.set(false);
        this.loadPosts();
      },
      error: (error) => {
        console.error('Failed to load profile:', error);

        this.errorMessage.set(
          'Failed to load profile. Please try again.'
        );

        this.isLoading.set(false);
        this.isPostsLoading.set(false);
      },
    });
  }

  loadPosts(): void {
    this.isPostsLoading.set(true);
    this.postsErrorMessage.set('');

    this.postService.getAllPosts().subscribe({
      next: (response) => {
        const allPosts: Post[] = response.data.posts ?? [];
        const currentUserId = this.user()?._id;

        if (currentUserId) {
          this.posts.set(
            allPosts.filter(
              (post) => post.user?._id === currentUserId
            )
          );
        } else {
          this.posts.set([]);
        }

        this.isPostsLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load posts:', error);

        this.postsErrorMessage.set('Failed to load posts.');
        this.isPostsLoading.set(false);
      },
    });
  }

  loadSavedPosts(): void {
    this.activeTab.set('saved');

    if (this.savedPosts().length > 0) {
      return;
    }

    this.isSavedPostsLoading.set(true);
    this.savedPostsErrorMessage.set('');

    this.postService.getSavedPosts().subscribe({
      next: (response) => {
        this.savedPosts.set(response.data.bookmarks ?? []);
        this.isSavedPostsLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load saved posts:', error);

        this.savedPostsErrorMessage.set(
          'Failed to load saved posts. Please try again.'
        );

        this.isSavedPostsLoading.set(false);
      },
    });
  }

  showMyPosts(): void {
    this.activeTab.set('posts');
  }
}

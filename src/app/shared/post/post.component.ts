
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { Post } from '../../core/interfaces/post.interface';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { AllCommentsComponent } from './all-comments/all-comments.component';

@Component({
  selector: 'app-post',
  imports: [DatePipe, AllCommentsComponent],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css',
})
export class PostComponent {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private router = inject(Router);

  onePost = input<Post>({} as Post);
  postDeleted = output<string>();

  // Used to change the actions displayed on the details page
  detailsMode = input(false);

  userData = this.authService.userData;

  // Open post details
  openDetails(): void {
    this.router.navigate(['/post-details', this.onePost()._id], {
      state: { post: this.onePost() },
    });
  }

  // Comments
  showComments = signal(false);

  toggleComments(): void {
    this.showComments.update(value => !value);
  }

  // Post owner
  isMyPost = computed(() => {
    return this.onePost().user?._id === this.userData()?._id;
  });

  // Options menu
  showOptions = signal(false);

  toggleOptions(): void {
    this.showOptions.update(value => !value);
  }

  // Edit post
  isEditing = signal(false);
  editedBody = signal('');
  isUpdating = signal(false);
  editMessage = signal('');

  startEditing(): void {
    if (!this.isMyPost()) return;

    this.editedBody.set(this.onePost().body ?? '');
    this.editMessage.set('');
    this.isEditing.set(true);
    this.showOptions.set(false);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.editedBody.set(this.onePost().body ?? '');
    this.editMessage.set('');
  }

  savePost(): void {
    const body = this.editedBody().trim();

    if (this.isUpdating() || !this.isMyPost()) return;

    if (!body) {
      this.editMessage.set('Post content cannot be empty.');
      return;
    }

    this.isUpdating.set(true);
    this.editMessage.set('');

    this.postService.updatePost(this.onePost()._id, { body }).subscribe({
      next: (res: any) => {
        this.onePost().body = res?.data?.post?.body ?? body;
        this.isEditing.set(false);
        this.isUpdating.set(false);
      },
      error: (err: any) => {
        this.editMessage.set(
          err.error?.message || 'Could not update post. Please try again.'
        );
        this.isUpdating.set(false);
      },
    });
  }

  // Bookmark
  isSaving = signal(false);
  bookmarkMessage = signal('');

  toggleBookmark(): void {
    if (this.isSaving()) return;

    this.isSaving.set(true);
    this.bookmarkMessage.set('');

    this.postService.toggleBookmark(this.onePost()._id).subscribe({
      next: (res: any) => {
        this.onePost().bookmarked = !this.onePost().bookmarked;
        this.bookmarkMessage.set(
          res?.message || 'Bookmark updated successfully'
        );
        this.isSaving.set(false);
        this.showOptions.set(false);
      },
      error: (err: any) => {
        this.bookmarkMessage.set(
          err.error?.message || 'Could not update bookmark'
        );
        this.isSaving.set(false);
      },
    });
  }

  // Post privacy
  privacyOptionsOpen = signal(false);
  isUpdatingPrivacy = signal(false);
  privacyMessage = signal('');

  privacyOptions = [
    { value: 'public', label: 'Public' },
    { value: 'following', label: 'Following' },
    { value: 'only_me', label: 'Only me' },
  ];

  togglePrivacyOptions(): void {
    if (!this.isMyPost() || this.isUpdatingPrivacy()) return;

    this.privacyOptionsOpen.update(value => !value);
    this.privacyMessage.set('');
  }

  updatePrivacy(privacy: string): void {
    if (
      !this.isMyPost() ||
      this.isUpdatingPrivacy() ||
      this.onePost().privacy === privacy
    ) {
      this.privacyOptionsOpen.set(false);
      return;
    }

    this.isUpdatingPrivacy.set(true);
    this.privacyMessage.set('');

    this.postService.updatePost(this.onePost()._id, { privacy }).subscribe({
      next: (res: any) => {
        this.onePost().privacy = res?.data?.post?.privacy ?? privacy;
        this.privacyOptionsOpen.set(false);
        this.isUpdatingPrivacy.set(false);
      },
      error: (err: any) => {
        this.privacyMessage.set(
          err.error?.message || 'Could not update post privacy.'
        );
        this.isUpdatingPrivacy.set(false);
      },
    });
  }

  getPrivacyLabel(): string {
    return this.privacyOptions.find(
      option => option.value === this.onePost().privacy
    )?.label ?? this.onePost().privacy;
  }

  // Delete post
  isDeleting = signal(false);

  deletePost(): void {
    if (this.isDeleting()) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    this.isDeleting.set(true);

    this.postService.deletePost(this.onePost()._id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showOptions.set(false);
        this.postDeleted.emit(this.onePost()._id);
      },
      error: (err: any) => {
        alert(err.error?.message || 'Could not delete post');
        this.isDeleting.set(false);
      },
    });
  }

  // Likes
  isLiking = signal(false);
  likeError = signal('');
  liked = signal<boolean | null>(null);
  likesCount = signal<number | null>(null);

  isLiked(): boolean {
    if (this.liked() !== null) return this.liked()!;

    const userId = this.userData()?._id;

    return !!userId && (this.onePost().likes ?? []).some(
      (like: any) => (typeof like === 'string' ? like : like?._id) === userId
    );
  }

  getLikesCount(): number {
    return this.likesCount() ?? this.onePost().likesCount ?? 0;
  }

  toggleLike(): void {
    if (this.isLiking()) return;

    const wasLiked = this.isLiked();
    const oldCount = this.getLikesCount();

    this.liked.set(!wasLiked);
    this.likesCount.set(Math.max(0, oldCount + (wasLiked ? -1 : 1)));
    this.isLiking.set(true);
    this.likeError.set('');

    this.postService.toggleLike(this.onePost()._id).subscribe({
      next: (res: any) => {
        const data = res?.data;
        const post = data?.post;

        if (typeof data?.liked === 'boolean') {
          this.liked.set(data.liked);
        } else if (Array.isArray(post?.likes)) {
          this.liked.set(this.isUserInLikes(post.likes));
        }

        this.likesCount.set(
          data?.likesCount ?? post?.likesCount ?? this.likesCount()
        );

        this.isLiking.set(false);
      },
      error: (err: any) => {
        this.liked.set(wasLiked);
        this.likesCount.set(oldCount);
        this.likeError.set(
          err.error?.message || 'Could not update like. Please try again.'
        );
        this.isLiking.set(false);
      },
    });
  }

  private isUserInLikes(likes: any[]): boolean {
    const userId = this.userData()?._id;

    return !!userId && likes.some(
      (like: any) => (typeof like === 'string' ? like : like?._id) === userId
    );
  }
}

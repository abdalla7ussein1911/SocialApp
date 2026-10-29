
import {Component,effect,inject,input,OnInit,signal,untracked} from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommentsService } from '../../../core/services/comments.service';

@Component({
  selector: 'app-all-comments',
  imports: [],
  templateUrl: './all-comments.component.html',
  styleUrl: './all-comments.component.css',
})
export class AllCommentsComponent implements OnInit {
  private readonly commentsService = inject(CommentsService);
  private readonly authService = inject(AuthService);

  postId = input.required<string>();
  showFullComments = input(false);

  userData = this.authService.userData;

  comments = signal<any[]>([]);
  visibleComments = signal(1);
  showAllComments = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  hasMoreComments = signal(true);

  // Add comment
  showCommentForm = signal(false);
  commentContent = signal('');
  isAddingComment = signal(false);

  // Edit and delete comment
  editingCommentId = signal<string | null>(null);
  editedCommentContent = signal('');
  isUpdatingComment = signal(false);
  deletingCommentId = signal<string | null>(null);

  // Three-dot comment menu
  openCommentMenuId = signal<string | null>(null);

  toggleCommentMenu(commentId: string): void {
    this.openCommentMenuId.update((currentId) =>
      currentId === commentId ? null : commentId
    );
  }

  // Replies and likes
  repliesByComment = signal<Record<string, any[]>>({});
  replyContent = signal<Record<string, string>>({});
  visibleReplies = signal<Record<string, boolean>>({});
  loadingReplies = signal<Record<string, boolean>>({});
  sendingReplies = signal<Record<string, boolean>>({});
  likingComments = signal<Record<string, boolean>>({});

  private currentLimit = 0;
  private readonly limitStep = 10;

  constructor() {
    effect(() => {
      const showAll = this.showFullComments();

      untracked(() => {
        if (showAll) {
          this.showAllComments.set(true);
          this.visibleComments.set(this.comments().length);

          if (this.hasMoreComments()) {
            this.getAllComments();
          }
        } else {
          this.showAllComments.set(false);
          this.visibleComments.set(1);
          this.showCommentForm.set(false);
          this.commentContent.set('');
        }
      });
    });
  }

  ngOnInit(): void {
    this.getAllComments();
  }

  // Load comments
  getAllComments(): void {
    if (this.isLoading() || !this.hasMoreComments()) return;

    const previousLimit = this.currentLimit;
    this.currentLimit += this.limitStep;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.commentsService
      .getPostComments(this.postId(), this.currentLimit)
      .subscribe({
        next: (res) => {
          const result =
            res?.data?.comments ??
            res?.data?.Comment ??
            res?.data?.posts ??
            res?.data;

          const newComments = Array.isArray(result) ? result : [];

          this.comments.set(newComments);
          this.hasMoreComments.set(
            newComments.length >= this.currentLimit
          );

          this.updateVisibleComments();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading comments:', err);
          this.errorMessage.set('Failed to load comments.');
          this.currentLimit = previousLimit;
          this.isLoading.set(false);
        },
      });
  }

  private updateVisibleComments(): void {
    this.visibleComments.set(
      this.showAllComments() || this.showFullComments()
        ? this.comments().length
        : 1
    );
  }

  toggleAllComments(): void {
    const showAll = !this.showAllComments();

    this.showAllComments.set(showAll);

    if (!showAll) {
      this.visibleComments.set(1);
      this.showCommentForm.set(false);
      this.commentContent.set('');
      this.openCommentMenuId.set(null);
      return;
    }

    this.visibleComments.set(this.comments().length);

    if (this.hasMoreComments()) {
      this.getAllComments();
    }
  }

  toggleCommentForm(): void {
    if (!this.showAllComments() && !this.showFullComments()) return;

    this.showCommentForm.update((value) => !value);

    if (!this.showCommentForm()) {
      this.commentContent.set('');
    }
  }

  showMoreComments(): void {
    if (this.isLoading()) return;

    if (this.visibleComments() < this.comments().length) {
      this.visibleComments.update((count) =>
        Math.min(count + this.limitStep, this.comments().length)
      );
      return;
    }

    this.getAllComments();
  }

  // Add comment
  addComment(): void {
    const content = this.commentContent().trim();

    if (!content || this.isAddingComment()) return;

    this.isAddingComment.set(true);
    this.errorMessage.set('');

    this.commentsService.addComment(this.postId(), content).subscribe({
      next: (res) => {
        const newComment = res?.data?.comment;

        if (newComment) {
          this.comments.update((comments) => [newComment, ...comments]);

          this.currentLimit = this.comments().length;
          this.visibleComments.set(
            this.showAllComments() || this.showFullComments()
              ? this.comments().length
              : 1
          );
        } else {
          this.currentLimit = 0;
          this.hasMoreComments.set(true);
          this.getAllComments();
        }

        this.commentContent.set('');
        this.showCommentForm.set(false);
        this.isAddingComment.set(false);
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.errorMessage.set('Failed to add comment.');
        this.isAddingComment.set(false);
      },
    });
  }

  // Edit comment
  startEditingComment(comment: any): void {
    if (comment.commentCreator?._id !== this.userData()?._id) return;

    this.openCommentMenuId.set(null);
    this.editingCommentId.set(comment._id);
    this.editedCommentContent.set(comment.content ?? '');
    this.errorMessage.set('');
  }

  cancelEditingComment(): void {
    this.editingCommentId.set(null);
    this.editedCommentContent.set('');
  }

  saveComment(comment: any): void {
    const content = this.editedCommentContent().trim();

    if (!content || this.isUpdatingComment()) return;

    this.isUpdatingComment.set(true);
    this.errorMessage.set('');

    this.commentsService
      .updateComment(this.postId(), comment._id, content)
      .subscribe({
        next: (res) => {
          const updatedContent = res?.data?.comment?.content ?? content;

          this.comments.update((comments) =>
            comments.map((item) =>
              item._id === comment._id
                ? { ...item, content: updatedContent }
                : item
            )
          );

          this.cancelEditingComment();
          this.isUpdatingComment.set(false);
        },
        error: (err) => {
          console.error('Edit comment error:', err);
          this.errorMessage.set(
            err.error?.message || 'Could not edit comment.'
          );
          this.isUpdatingComment.set(false);
        },
      });
  }

  // Delete comment
  deleteComment(comment: any): void {
    if (this.deletingCommentId()) return;

    if (comment.commentCreator?._id !== this.userData()?._id) return;

    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.deletingCommentId.set(comment._id);
    this.errorMessage.set('');
    this.openCommentMenuId.set(null);

    this.commentsService
      .deleteComment(this.postId(), comment._id)
      .subscribe({
        next: () => {
          this.comments.update((comments) =>
            comments.filter((item) => item._id !== comment._id)
          );

          this.currentLimit = this.comments().length;

          this.visibleComments.set(
            Math.min(this.visibleComments(), this.comments().length)
          );

          this.deletingCommentId.set(null);

          if (this.comments().length === 0) {
            this.showAllComments.set(false);
          }
        },
        error: (err) => {
          console.error('Delete comment error:', err);
          this.errorMessage.set(
            err.error?.message || 'Could not delete comment.'
          );
          this.deletingCommentId.set(null);
        },
      });
  }

  // Replies
  toggleReplies(comment: any): void {
    const commentId = comment._id;
    const currentlyVisible = !!this.visibleReplies()[commentId];

    this.visibleReplies.update((state) => ({
      ...state,
      [commentId]: !currentlyVisible,
    }));

    if (!currentlyVisible && !this.repliesByComment()[commentId]) {
      this.loadReplies(commentId);
    }
  }

  loadReplies(commentId: string): void {
    this.loadingReplies.update((state) => ({
      ...state,
      [commentId]: true,
    }));

    this.commentsService
      .getCommentReplies(this.postId(), commentId)
      .subscribe({
        next: (res) => {
          const replies = res?.data?.replies ?? [];

          this.repliesByComment.update((state) => ({
            ...state,
            [commentId]: Array.isArray(replies) ? replies : [],
          }));

          this.loadingReplies.update((state) => ({
            ...state,
            [commentId]: false,
          }));
        },
        error: (err) => {
          console.error('Error loading replies:', err);

          this.loadingReplies.update((state) => ({
            ...state,
            [commentId]: false,
          }));
        },
      });
  }

  setReplyContent(commentId: string, content: string): void {
    this.replyContent.update((state) => ({
      ...state,
      [commentId]: content,
    }));
  }

  addReply(comment: any): void {
    const commentId = comment._id;
    const content = (this.replyContent()[commentId] ?? '').trim();

    if (!content || this.sendingReplies()[commentId]) return;

    this.sendingReplies.update((state) => ({
      ...state,
      [commentId]: true,
    }));

    this.commentsService
      .addReply(this.postId(), commentId, content)
      .subscribe({
        next: (res) => {
          const reply = res?.data?.reply ?? res?.data?.comment;

          if (reply) {
            this.repliesByComment.update((state) => ({
              ...state,
              [commentId]: [...(state[commentId] ?? []), reply],
            }));
          } else {
            this.loadReplies(commentId);
          }

          this.comments.update((comments) =>
            comments.map((item) =>
              item._id === commentId
                ? {
                    ...item,
                    repliesCount: (item.repliesCount ?? 0) + 1,
                  }
                : item
            )
          );

          this.replyContent.update((state) => ({
            ...state,
            [commentId]: '',
          }));

          this.sendingReplies.update((state) => ({
            ...state,
            [commentId]: false,
          }));

          this.visibleReplies.update((state) => ({
            ...state,
            [commentId]: true,
          }));
        },
        error: (err) => {
          console.error('Error adding reply:', err);
          this.errorMessage.set('Failed to add reply.');

          this.sendingReplies.update((state) => ({
            ...state,
            [commentId]: false,
          }));
        },
      });
  }

  // Like comment
  toggleLike(comment: any): void {
    const commentId = comment._id;

    if (this.likingComments()[commentId]) return;

    this.likingComments.update((state) => ({
      ...state,
      [commentId]: true,
    }));

    this.commentsService
      .toggleCommentLike(this.postId(), commentId)
      .subscribe({
        next: (res) => {
          const updatedComment = res?.data?.comment ?? res?.data;

          this.comments.update((comments) =>
            comments.map((item) => {
              if (item._id !== commentId) return item;

              if (
                updatedComment?._id === commentId &&
                Array.isArray(updatedComment.likes)
              ) {
                return { ...item, ...updatedComment };
              }

              const currentUserId = this.userData()?._id;
              const likes: string[] = item.likes ?? [];
              const alreadyLiked =
                !!currentUserId && likes.includes(currentUserId);

              return {
                ...item,
                likes: alreadyLiked
                  ? likes.filter((id) => id !== currentUserId)
                  : currentUserId
                    ? [...likes, currentUserId]
                    : likes,
              };
            })
          );

          this.likingComments.update((state) => ({
            ...state,
            [commentId]: false,
          }));
        },
        error: (err) => {
          console.error('Error liking comment:', err);
          this.errorMessage.set('Failed to like comment.');

          this.likingComments.update((state) => ({
            ...state,
            [commentId]: false,
          }));
        },
      });
  }

  // Time ago
  getTimeAgo(date: string): string {
    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) return '';

    const seconds = Math.max(
      0,
      Math.floor((Date.now() - timestamp) / 1000)
    );

    if (seconds < 60) return 'منذ لحظات';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return minutes === 1 ? 'منذ دقيقة' : `منذ ${minutes} دقيقة`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return hours === 1 ? 'منذ ساعة' : `منذ ${hours} ساعة`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
      return days === 1 ? 'منذ يوم' : `منذ ${days} يوم`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return months === 1 ? 'منذ شهر' : `منذ ${months} شهر`;
    }

    const years = Math.floor(months / 12);
    return years === 1 ? 'منذ سنة' : `منذ ${years} سنة`;
  }
}

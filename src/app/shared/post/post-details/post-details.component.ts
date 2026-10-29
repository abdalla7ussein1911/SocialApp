import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { PostComponent } from '../post.component';
import { AllCommentsComponent } from '../all-comments/all-comments.component';

@Component({
  selector: 'app-post-details',
  imports: [PostComponent, AllCommentsComponent],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css',
})
export class PostDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postService = inject(PostService);

  post = signal<any | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');

    if (!postId) {
      this.errorMessage.set('Post not found.');
      this.isLoading.set(false);
      return;
    }

    const navigationPost = history.state?.post;

    if (navigationPost?._id === postId) {
      this.post.set(navigationPost);
      this.isLoading.set(false);
      return;
    }

    this.postService.getAllPosts().subscribe({
      next: (res: any) => {
        const posts = res?.data?.posts ?? res?.data?.postsList ?? res?.data;
        const foundPost = Array.isArray(posts)
          ? posts.find((item: any) => item._id === postId)
          : null;

        if (foundPost) {
          this.post.set(foundPost);
        } else {
          this.errorMessage.set('Post not found.');
        }

        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.errorMessage.set(
          err?.error?.message || 'Could not load post details.'
        );
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/feed']);
  }
}

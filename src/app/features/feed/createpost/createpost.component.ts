import { Component, inject, signal, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/interfaces/user.interface';
import { PostService } from '../../../core/services/post.service';

@Component({
  selector: 'app-createpost',
  imports: [FormsModule],
  templateUrl: './createpost.component.html',
  styleUrl: './createpost.component.css',
})
export class CreatepostComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly postService = inject(PostService);

  userData = signal<User | null>(null);

  postContent = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  selectedPrivacy = signal('public');
  privacyOptionsOpen = signal(false);

  // Emoji picker
  emojiPickerOpen = signal(false);

  emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😍', '🥰', '😘',
    '😎', '🤩', '🥳', '😋', '😜', '🤗', '🤔', '🤭',
    '😭', '😢', '😡', '🤯', '🥹', '😴', '🤝', '👏',
    '👍', '👎', '❤️', '🧡', '💛', '💚', '💙', '💜',
    '🔥', '✨', '🎉', '💯', '🙏', '💪', '🌹', '☀️',
    '🌍', '⚽', '🎮', '🎵', '🍕', '☕', '🐱', '🐶'
  ];

  privacyOptions = [
    { value: 'public', label: 'Public' },
    { value: 'following', label: 'Following' },
    { value: 'only_me', label: 'Only me' },
  ];

  isLoading = signal(false);
  message = signal('');
  isSuccess = signal(false);

  postCreated = output<void>();

  ngOnInit(): void {
    this.userData.set(this.authService.userData());
  }

  togglePrivacyOptions(): void {
    if (this.isLoading()) return;

    this.privacyOptionsOpen.update(value => !value);
  }

  selectPrivacy(privacy: string): void {
    this.selectedPrivacy.set(privacy);
    this.privacyOptionsOpen.set(false);
  }

  getPrivacyLabel(): string {
    return (
      this.privacyOptions.find(
        option => option.value === this.selectedPrivacy()
      )?.label ?? 'Public'
    );
  }

  toggleEmojiPicker(): void {
    if (this.isLoading()) return;

    this.emojiPickerOpen.update(value => !value);
  }

  insertEmoji(emoji: string, textarea: HTMLTextAreaElement): void {
    if (this.isLoading()) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    this.postContent =
      this.postContent.substring(0, start) +
      emoji +
      this.postContent.substring(end);

    this.emojiPickerOpen.set(false);

    // Return focus and place the cursor after the inserted emoji.
    setTimeout(() => {
      textarea.focus();

      const cursorPosition = start + emoji.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) return;

    this.removeFile();

    this.selectedFile = file;
    this.imagePreview = URL.createObjectURL(file);
  }

  removeFile(): void {
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
    }

    this.selectedFile = null;
    this.imagePreview = null;
  }

  submitPost(): void {
    if (!this.postContent.trim() && !this.selectedFile) {
      this.message.set('Write something or select a file first.');
      this.isSuccess.set(false);
      return;
    }

    const formData = new FormData();

    if (this.postContent.trim()) {
      formData.append('body', this.postContent.trim());
    }

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    formData.append('privacy', this.selectedPrivacy());

    this.isLoading.set(true);
    this.message.set('');
    this.emojiPickerOpen.set(false);

    this.postService.createPost(formData).subscribe({
      next: (res: any) => {
        this.message.set(res?.message || 'Post created successfully.');
        this.isSuccess.set(true);

        this.postContent = '';
        this.selectedPrivacy.set('public');
        this.privacyOptionsOpen.set(false);
        this.emojiPickerOpen.set(false);
        this.removeFile();

        this.postCreated.emit();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Create post error:', err);
        console.error('Error body:', err.error);

        this.message.set(
          err.error?.message || 'Could not create post. Please try again.'
        );

        this.isSuccess.set(false);
        this.isLoading.set(false);
      },
    });
  }
}

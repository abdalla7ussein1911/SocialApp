
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SuggestedFriendsService } from '../../../core/services/suggested-friends.service';
import { User } from '../../../core/interfaces/user.interface';

@Component({
  selector: 'app-suggested-friends',
  imports: [FormsModule],
  templateUrl: './suggested-friends.component.html',
  styleUrl: './suggested-friends.component.css',
})
export class SuggestedFriendsComponent {
  private readonly suggestedFriendsService = inject(SuggestedFriendsService);

  readonly suggestions = signal<User[]>([]);
  readonly searchTerm = signal('');
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly followingIds = signal<string[]>([]);

  readonly filteredSuggestions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.suggestions();
    }

    return this.suggestions().filter(
      (friend) =>
        (friend.name ?? '').toLowerCase().includes(term) ||
        (friend.username ?? '').toLowerCase().includes(term)
    );
  });

  constructor() {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.suggestedFriendsService.getSuggestions().subscribe({
      next: (res) => {
        this.suggestions.set(res?.data?.suggestions ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Suggestions error:', err);
        this.errorMessage.set('Failed to load suggested friends.');
        this.isLoading.set(false);
      },
    });
  }

  followUser(userId: string): void {
    if (this.followingIds().includes(userId)) {
      return;
    }

    this.followingIds.update((ids) => [...ids, userId]);

    this.suggestedFriendsService.followUser(userId).subscribe({
      next: (res) => {
        if (res?.success && res?.data?.following === true) {
          this.suggestions.update((friends) =>
            friends.filter((friend) => friend._id !== userId)
          );

          this.loadOneSuggestion();
        }

        this.followingIds.update((ids) =>
          ids.filter((id) => id !== userId)
        );
      },
      error: (err) => {
        console.error('Follow error:', err);

        this.followingIds.update((ids) =>
          ids.filter((id) => id !== userId)
        );
      },
    });
  }

  loadOneSuggestion(): void {
    this.suggestedFriendsService.getSuggestions().subscribe({
      next: (res) => {
        const currentIds = this.suggestions().map((friend) => friend._id);

        const newFriend = (res?.data?.suggestions ?? []).find(
          (friend: User) => !currentIds.includes(friend._id)
        );

        if (newFriend) {
          this.suggestions.update((friends) => [...friends, newFriend]);
        }
      },
      error: (err) => {
        console.error('New suggestion error:', err);
      },
    });
  }
}

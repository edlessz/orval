import { Component, signal } from '@angular/core';
import { injectListPets } from '../api/endpoints/pets/pets';

@Component({
  selector: 'app-root',
  imports: [],
  template: `
    <div class="App">
      <h1>Hello, {{ title() }}</h1>
      <header class="App-header">
        <img src="logo.svg" class="App-logo" alt="logo" />

        @if (petsQuery.isPending()) {
          <p>Loading pets...</p>
        }

        @if (petsQuery.isError()) {
          <p>Error: {{ petsQuery.error()?.message }}</p>
        }

        @if (petsQuery.isSuccess()) {
          @for (pet of petsQuery.data(); track pet.id) {
            <p>{{ pet.name }} @if (pet.tag) {({{ pet.tag }})}</p>
          }
        }

        <button (click)="refetch()" [disabled]="petsQuery.isFetching()">
          {{ petsQuery.isFetching() ? 'Refreshing...' : 'Refresh' }}
        </button>
      </header>
    </div>
  `,
})
export class App {
  // Use angular-query with Signal parameters
  protected readonly petsQuery = injectListPets(signal({}));
  protected readonly title = signal('angular-query');

  protected refetch() {
    this.petsQuery.refetch();
  }
}

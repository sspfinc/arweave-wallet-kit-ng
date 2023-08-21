import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileModalComponent } from './profile-modal.component';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

@NgModule({
  declarations: [ProfileModalComponent],
  imports: [CommonModule, FormsModule, ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink) {
        return {
          cache: new InMemoryCache(),
          link: httpLink.create({
            uri: 'https://arweave.net/graphql',
          }),
        };
      },
      deps: [HttpLink],
    },
  ],
  exports: [ProfileModalComponent],
})
export class AWKProfileModalModule {}

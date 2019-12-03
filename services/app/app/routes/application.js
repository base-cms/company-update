import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject } from '@ember/service';
import { queryManager } from 'ember-apollo-client';

import query from 'cuf/gql/queries/config';

export default Route.extend(ApplicationRouteMixin, {
  config: inject(),
  apollo: queryManager(),

  model() {
    return this.apollo.query({ query }, 'companyUpdateConfig');
  },
  afterModel({
    domain,
    logo,
    ids,
    isPmmi,
  }) {
    this.config.load({
      domain,
      logo,
      ids,
      isPmmi,
    });
  },
});
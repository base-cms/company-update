import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { inject } from '@ember/service';
import { queryManager } from 'ember-apollo-client';
import ActionMixin from 'cuf/mixins/action';
import mutation from 'cuf/gql/mutations/portal/company';

const { error } = console;

const getFiltered = (model, key) => {
  const v = get(model, key);
  if (key == 'socialLinks') {
    return v.map(({ url, provider }) => ({ url, provider }));
  }
  return v;
};

const filterModel = (model = {}) => {
  const payload = {};
  Object.keys(model).forEach(key => payload[key] = getFiltered(model, key));
  return payload;
};

export default Component.extend(ActionMixin, {
  apollo: queryManager(),
  notify: inject(),
  session: inject(),

  model: null,
  name: computed.reads('session.data.authenticated.name'),
  email: computed.reads('session.data.authenticated.email'),

  isOpen: false,
  isInvalid: computed('name', 'email', function() {
    if (!this.name || !this.email) return true;
    return false;
  }),
  isSubmitDisabled: computed.or('isActionRunning', 'isInvalid'),

  actions: {
    async submit() {
      this.startAction();
      const { name, email } = this.getProperties('name', 'email');
      const { hash } = this.model;
      const payload = filterModel(this.model);
      const type = 'company';
      const variables = { input: { name, email, hash, type, payload } };

      try {
        await this.apollo.mutate({ mutation, variables, refetchQueries: ['CompanyUpdateContentHashQuery'] });
        if (!this.isDestroyed) this.set('isOpen', false);
        this.notify.info('Changes requested. You will recieve an email shortly confirming your request.', { clearDuration: 30000 });
        this.onComplete();
      } catch (e) {
        error(e);
        this.notify.error('Something went wrong -- please review your information and try again!', { autoClear: false });
      } finally {
        this.endAction();
      }
    },

    clear() {
    },
  },

});
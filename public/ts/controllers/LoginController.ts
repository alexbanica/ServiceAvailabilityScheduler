import { LoginService } from '../services/LoginService.js';

export class LoginController {
  bootstrap(Vue: any): void {
    const { createApp, ref } = Vue;

    createApp({
      setup: () => {
        const email = ref('');
        const error = ref('');
        const submitting = ref(false);

        const submit = async () => {
          error.value = '';
          submitting.value = true;
          try {
            await LoginService.login(email.value.trim());
            window.location.href = '/';
          } catch (err) {
            error.value = (err as Error).message;
          } finally {
            submitting.value = false;
          }
        };

        return {
          email,
          error,
          submitting,
          submit,
        };
      },
    }).mount('#login-app');
  }
}

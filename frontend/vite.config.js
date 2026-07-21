/** @type {import('vite').UserConfig} */
export default {
  server: {
    host: '0.0.0.0',
    port: 4000,
    // Leading dot = this host + all subdomains (Vite).
    // Angular CLI ignores this file for ng serve — use angular.json.
    allowedHosts: ['.cloudpub.ru', 'localhost', '127.0.0.1'],
  },
};

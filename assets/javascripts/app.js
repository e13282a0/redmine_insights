
var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue.js!'
    },
    vuetify: new Vuetify(),
    methods: {
      reverseMessage: function () {
        this.message = this.message.split('').reverse().join('')
      }
    }
  })
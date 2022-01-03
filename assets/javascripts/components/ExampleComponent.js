Vue.component('button-counter', {
    data: function () {
      return {
        count: 0
      }
    },
    methods:{
      countOne: function() {
        this.count++
      }
    },
    template: '<v-btn v-on:click.native="countOne()">You clicked me {{ count }} times.</v-btn>'
  })
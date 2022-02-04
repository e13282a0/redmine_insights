<template>
  <v-card width="100%" flat>
    <v-toolbar dense flat>
      <v-toolbar-title>{{ this.title }}</v-toolbar-title>
    </v-toolbar>

    <v-card-text>
      <div style="width: 80%; height: 100vh">
        <v-chart autoresize :option="options" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
module.exports = {
  props: ["series", "title"],
  data() {
    return {};
  },
  computed: {
    options() {
      return {
        series: {
          type: "sunburst",
          data: this.series,
          radius: [0, "95%"],
          sort: undefined,
          emphasis: {
            focus: "ancestor",
          },
          levels: [
            {},
            {
              r0: "30%",
              r: "45%",
              itemStyle: {
                borderWidth: 2,
              },
              label: {
                rotate: "tangential",
              },
            },
            {
              r0: "45%",
              r: "80%",
              label: {
                align: "right",
              },
            },
            {
              r0: "80%",
              r: "82%",
              label: {
                position: "outside",
                padding: 3,
                silent: false,
              },
              itemStyle: {
                borderWidth: 3,
              },
            },
          ],
        },
      };
    },
  },

  methods: {},
};
</script>

<style scoped>
.focus {
  border: 2px #ffac55 solid;
}
</style>

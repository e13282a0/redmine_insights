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
    filteredSeries() {
      function shortNames(arrNodes) {
        return arrNodes.map(function (node) {
          node.name = node.name.replace(/(.{30})..+/, "$1…");
          return node;
        });
      }

      return shortNames(this.series)
    },
    options() {
      return {
        series: {
          type: "sunburst",
          data: this.filteredSeries,
          radius: [0, "95%"],
          sort: undefined,
          emphasis: {
            focus: "ancestor",
          },
          levels: [
            {},
            {
              r0: "25%",
              r: "40%",
              itemStyle: {
                borderWidth: 2,
              },
              label: {
                rotate: "tangential",
              },
            },
            {
              r0: "40%",
              r: "75%",
              label: {
                align: "right",
              },
            },
            {
              r0: "75%",
              r: "77%",
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

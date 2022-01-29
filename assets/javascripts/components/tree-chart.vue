<template>
  <v-card width="100%" flat>
    <v-toolbar dense flat>
      <v-toolbar-title>{{ this.title }}</v-toolbar-title>
    </v-toolbar>

    <v-card-text>
      <div style="width: 80%; height: 400px">
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
      const formatUtil = echarts.format;
      return {
        tooltip: {
          formatter: function (info) {
            var value = info.value;
            var treePathInfo = info.treePathInfo;
            var treePath = [];
            for (var i = 1; i < treePathInfo.length; i++) {
              treePath.push(treePathInfo[i].name);
            }
            return [
              '<div class="tooltip-title">' +
                formatUtil.encodeHTML(treePath.join("/")) +
                "</div>",
              "Disk Usage: " + formatUtil.addCommas(Math.ceil(value)) + " h",
            ].join("");
          },
        },
        series: [
          {
            name: "hours",
            type: "treemap",
            visibleMin: 300,
            label: {
              show: true,
              formatter: "{b}",
            },
            itemStyle: {
              borderColor: "#fff",
            },
            upperLabel: {
              show: true,
              height: 30,
            },
            levels: this.getLevelOption(),
            data: this.series,
          },
        ],
      };
    },
  },

  methods: {
    getLevelOption() {
      return [
        {
          itemStyle: {
            borderColor: "#777",
            borderWidth: 0,
            gapWidth: 1,
          },
          upperLabel: {
            show: false,
          },
        },
        {
          itemStyle: {
            borderColor: "#555",
            borderWidth: 5,
            gapWidth: 1,
          },
          emphasis: {
            itemStyle: {
              borderColor: "#ddd",
            },
          },
        },
        {
          colorSaturation: [0.35, 0.5],
          itemStyle: {
            borderWidth: 5,
            gapWidth: 1,
            borderColorSaturation: 0.6,
          },
        },
      ];
    },
  },
};
</script>

<style scoped>
.focus {
  border: 2px #ffac55 solid;
}
</style>

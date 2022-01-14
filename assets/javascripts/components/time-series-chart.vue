<template>
  <v-card width="100%" flat>
    <v-card-title>
      {{ this.title }}

      
      <v-switch
        v-model="cumulative"
        :label="`cumulative: ${cumulative.toString()}`"
      />
    </v-card-title>
    <v-card-text>
      <div style="width: 100%; height: 300px">
        <v-chart autoresize :option="options" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
module.exports = {
  props: ["series", "title"],
  data() {
    return {
      cumulative: false,
    };
  },
  computed: {
    seriesData() {
      let _this = this;
      let result = [];
      this.series.items.forEach(function (item) {
        result.push({
          name: item,
          type: "line",
          stack: "total",
          data: _this.series.data[item].map((elm) => {
            return _this.cumulative ? elm.sum : elm.val;
          }),
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
        });
      });
      return result;
    },
    options() {
      return {
        textStyle: {
          fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          orient: "vertical",
          right: 10,
          top: "center",
          data: this.series.items,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        grid: {
          left: "3%",
          right: "200",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.series.axis,
        },
        yAxis: {
          type: "value",
        },
        series: this.seriesData,
      };
    },
  },

  methods: {
    focus() {
      this.isFocus = true;
    },
    blur() {
      this.isFocus = false;
    },
  },
};
</script>

<style scoped>
.focus {
  border: 2px #ffac55 solid;
}
</style>
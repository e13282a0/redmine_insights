<template>
  <v-card width="100%" flat>
    <v-toolbar dense flat>
      <v-toolbar-title>{{ this.title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <div>
        <v-switch
          v-model="cumulative"
          :label="`cumulative: ${cumulative.toString()}`"
        />
      </div>
      <v-spacer></v-spacer>
      <div style="width: 300px">
        <v-slider
          v-if="!cumulative"
          v-model="avgDuration"
          label="average"
          min="0"
          max="50"
          step="5"
          thumb-label
        />
      </div>
      <v-spacer></v-spacer>
    </v-toolbar>

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
      avgDuration: 0,
    };
  },
  computed: {
    seriesData() {
      let _this = this;
      let result = [];
      this.series.items.forEach(function (item) {
        let selectedData = _this.series.data[item].map((elm) => {
          return _this.cumulative ? elm.sum : elm.val;
        });

        result.push({
          name: item,
          type: "line",
          stack: "total",
          data: _this.cumulative
            ? selectedData
            : _this.avgArr(selectedData, _this.avgDuration),
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          markLine: {
            symbol: ["none", "none"],
            label: {
              formatter: "{b}",
              position: "insideEndTop",
            },
            data: _this.series.markLines,
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
    movingAvg(array, count) {
      const _count = Math.min(count, array.length) * -1;
      const arrayToSum = array.slice(_count);
      const avg =
        arrayToSum.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0) /
        arrayToSum.length;
      return avg;
    },

    avgArr(array, interval) {
      if (interval == 0) return array;

      let result = [];
      let avgStarted = false;
      let avgCounter = 0;
      for (let i = 0; i < array.length; i++) {
        avgStarted = avgStarted || array[i] > 0;
        if (avgStarted) {
          avgCounter += 1;
          result.push(
            Math.round(
              this.movingAvg(array.slice(0, i), Math.min(interval, avgCounter))
            )
          );
        } else {
          result.push(0);
        }
      }
      return result;
    },
  },
};
</script>

<style scoped>
.focus {
  border: 2px #ffac55 solid;
}
</style>
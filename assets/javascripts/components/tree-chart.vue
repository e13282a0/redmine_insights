<template>
  <v-card width="100%" flat>
    <v-toolbar dense flat>
      <v-toolbar-title>{{ this.title }}</v-toolbar-title>
    </v-toolbar>

    <v-card-text>
      <div style="width: 80%; height: 600px">
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
    rich() {
      return {
        new: {
          color: "blue",
          fontSize: 9,
        },
        progress: {
          color: "green",
          fontSize: 9,
        },
        done: {
          color: "lightgrey",
          fontStyle: "italic",
          fontSize: 9,
        },
      };
    },
    options() {
      return {
        toolbox: {
          show: true,
          feature: {
            dataView: {
              show: true,
              title: "Data View",
              readOnly: false,
              lang: ["Data View", "Close", "Update"],
            },
            saveAsImage: { show: true, title: "Save Image as PNG" },
          },
        },
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove",
          formatter: function (info) {
                  
                  return info.name+"<br>"+Math.ceil(info.value)+"h <br>"+info.assignee;
                },
        },

        series: [
          {
            type: "tree",
            data: [{ name: "", children: this.series }],
            top: "1%",
            left: "7%",
            bottom: "1%",
            right: "20%",
            symbolSize: 7,

            label: {
              position: "left",
              verticalAlign: "middle",
              align: "right",
              fontSize: 9,
              formatter: function (info) {
                  //if (info.name ==="ert")
                  //debugger;
                  let style;
                  if (info.data.is_closed) style = "done";
                  else if (info.data.status === "New") style = "new";
                  else style = "progress";
                  //return info.name;
                  return "{" + style + "|" + info.name + "}";
                },
              rich: this.rich
            },
            leaves: {
              label: {
                position: "right",
                verticalAlign: "middle",
                align: "left",
                formatter: function (info) {
                  //if (info.name ==="ert")
                  //debugger;
                  let style;
                  if (info.data.is_closed) style = "done";
                  else if (info.data.status === "New") style = "new";
                  else style = "progress";
                  //return info.name;
                  return "{" + style + "|" + info.name + "}";
                },
                rich: this.rich
              },
            },
            emphasis: {
              focus: "descendant",
            },
            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750,
          },
        ],
      };
    },
  },

  methods: {
    
  },
};
</script>

<style scoped>
.focus {
  border: 2px #ffac55 solid;
}
</style>

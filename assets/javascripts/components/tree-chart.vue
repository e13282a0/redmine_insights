<template>
  <v-card width="100%" flat>
    <v-toolbar dense flat>
      <v-toolbar-title>{{ this.title }}</v-toolbar-title>
      <div style="width: 40px"></div>
      <div>
        <v-btn-toggle v-model="showClosed" mandatory>
          <v-btn small :value="false">hide closed</v-btn>
          <v-btn small :value="true">show closed</v-btn>
        </v-btn-toggle>
      </div>
      <div style="width: 40px"></div>
      <div>
        <v-btn-toggle v-model="autoDepth" >
          <v-btn small :value=0>1</v-btn>
          <v-btn small :value=1>2</v-btn>
          <v-btn small :value=2>3</v-btn>
        </v-btn-toggle>
      </div>
    </v-toolbar>

    <v-card-text>
      <div style="width: 80%; height: 90vh">
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
      showClosed: true,
      autoDepth: 1,
      revision:0,
    };
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
    filteredSeries() {
      function filterClosed(arrNodes) {
        let result = [];
        arrNodes.forEach(function (node) {
          if (!node.is_closed) {
            result.push(node);
            if (node.children.length > 0)
              node.children = filterClosed(node.children);
          }
        });
        //debugger;
        return result;
      }

      function autoCollapse(arrNodes, autoDepth, depth=0) {
        return arrNodes.map(function (node) {
          node.collapsed = (depth >= autoDepth);
          node.children = autoCollapse(node.children, autoDepth, depth + 1);
          return node;
        });
      }
      if (this.showClosed) return autoCollapse(this.series, this.autoDepth);
      else return autoCollapse(filterClosed(this.series), this.autoDepth);
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
            return info.name + "<br>" + Math.ceil(info.value) + "h";
          },
        },

        series: [
          {
            type: "tree",
            data: [{ name: "", children: this.filteredSeries }],
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
                else if (info.data.is_open) style = "new";
                else style = "progress";
                //return info.name;
                return "{" + style + "|" + info.name + "}";
              },
              rich: this.rich,
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
                  else if (info.data.is_open) style = "new";
                  else style = "progress";
                  //return info.name;
                  return "{" + style + "|" + info.name + "}";
                },
                rich: this.rich,
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

  methods: {},
};
</script>

<style scoped>
.focus {
  border: 2px #ffac55 solid;
}
</style>

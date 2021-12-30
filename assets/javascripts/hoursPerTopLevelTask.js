// Create Time Beam Array
function getTimeBeam(pastWeeks, futureWeeks = 0) {
    let result = [];
    let runningDate = moment().subtract(pastWeeks, 'week');
    const _pastWeeks = pastWeeks * -1;
    for (let i = _pastWeeks; i <= futureWeeks; i++) {
        result.push({ week: runningDate.week(), year: runningDate.year() });
        runningDate.add(1, "week");
    }
    return result;
}

// Calculate moving Average
function movingAvg(array, count) {
    const _count = Math.min(count, array.length) * -1;
    const arrayToSum = array.slice(_count);
    const avg = arrayToSum.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0) / arrayToSum.length;
    return avg;
}


function getTimeSeriesData(timeEntries, issues, versions, avgLines = []) {
    let firstTimeEntry = timeEntries.reduce(function (prev, curr) {
        return moment(prev.spentOn) < moment(curr.spentOn) ? prev : curr;
    });

    let startDate = moment(firstTimeEntry.spentOn);
    let weeks = moment().diff(startDate, 'week') + 2;

    let topLevelIssues = issues.filter((issue) => {
        return issue.isTopLevel;
    });
    let timeBeam = getTimeBeam(weeks);
    let result = {};
    result.legend = [];
    result.xAxis = timeBeam.map(elm => elm.week + '/' + elm.year)
    result.lines = [];
    result.avgLines = [];
    result.all = [];
    result.sum = [];
    result.markLineData = [];

    // make Lines
    topLevelIssues.forEach(function (issue) {
        let sum = 0;
        let valArr = [];
        let sumArr = [];
        for (let i = 0; i < timeBeam.length; i++) {
            relatedTimeEntries = timeEntries.filter(function (timeEntry) { return (timeEntry.topLevelID == issue.issueID && timeEntry.week == timeBeam[i].week && timeEntry.year == timeBeam[i].year) });
            val = relatedTimeEntries.reduce(function (sum, current) { return sum + current.hours; }, 0);
            sum += val;
            valArr.push(val);
            sumArr.push(sum);
            // add total
            if (i >= result.all.length)
                result.all.push(val);
            else
                result.all[i] += val;
            // add total Sum
            if (i >= result.sum.length)
                result.sum.push(sum);
            else
                result.sum[i] += sum;
            // add markline
            let version = versions.find(function (elm) { return elm.week == timeBeam[i].week && elm.year == timeBeam[i].year })
            if (version) {
                result.markLineData.push({
                    xAxis: i,
                    name: version.name
                })
            }
        }
        result.lines.push({ 'name': issue.subject, 'valArr': valArr, 'sumArr': sumArr })
    });

    // make avg
    avgLines.forEach(function (avgLine) {
        let started = false;
        let counter = 0;
        let sumArray = [];
        //let avg4Weeks = [];
        let avgArr = [];
        for (let i = 0; i < result.all.length; i++) {
            let weekSum = result.all[i];
            sumArray.push(weekSum);
            started = started || weekSum > 0;
            if (started) {
                counter += 1;
                avgArr.push(Math.round(movingAvg(sumArray, Math.min(avgLine, counter))));
            } else {
                avgArr.push(0);
            }
        }
        result.avgLines.push({ 'name': 'avg ' + avgLine + ' w', 'valArr': avgArr })
    })
    return result;
}

// create Graph

function weeklyHours(timeSeriesData) {
    let series = [];
    let legend = [];

    timeSeriesData.lines.forEach(function (line) {
        legend.push(line.name);
        series.push({
            name: line.name,
            type: 'line',
            stack: 'Total',
            data: line.valArr,
            areaStyle: {},
            emphasis: {
                focus: 'series'
            },
            markLine: {
                symbol: ['none', 'none'],
                label: {
                    formatter: '{b}',
                    position: 'insideEndTop'
                },
                data: timeSeriesData.markLineData
            },
        });
    })

    timeSeriesData.avgLines.forEach(function (avgLine) {
        legend.push(avgLine.name);
        series.push({
            name: avgLine.name,
            type: 'line',
            smooth: true,
            lineStyle: {
                color: '#000000',
                width: 1,
                type: 'dashed'
            },
            data: avgLine.valArr,
            markLine: {
                symbol: ['none', 'none'],
                label: {
                    formatter: '{b}',
                    position: 'insideEndTop'
                },
                data: timeSeriesData.markLineData
            },
        });
    })

    let option = {
        title: {
            text: 'hours per calender week'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: legend,
            orient: 'vertical',
            right: 10,
            top: 'center'
        },
        grid: {
            left: '3%',
            right: '200',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeSeriesData.xAxis
        },
        yAxis: {
            type: 'value'
        },
        series: series
    };
    return option;
}

/**
 * Graph for summed hours
 * @param {*} timeSeriesData 
 * @returns 
 */
function weeklyHoursSummed(timeSeriesData) {
    let series = [];
    let legend = [];

    timeSeriesData.lines.forEach(function (line) {
        legend.push(line.name);
        series.push({
            name: line.name,
            type: 'line',
            stack: 'Total',
            data: line.sumArr,
            markLine: {
                symbol: ['none', 'none'],
                label: {
                    formatter: '{b}',
                    position: 'insideEndTop'
                },
                data: timeSeriesData.markLineData
            },
            areaStyle: {},
            emphasis: {
                focus: 'series'
            },
        });
    })


    let option = {
        title: {
            text: 'summed hours per calender week'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: legend,
            orient: 'vertical',
            right: 10,
            top: 'center'
        },
        grid: {
            left: '3%',
            right: '200',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeSeriesData.xAxis
        },
        yAxis: {
            type: 'value'
        },
        series: series
    };
    return option;
}


function getChildIssues(issues, issueID) {
    return issues.filter((issue) => {
        return issue.parentID === issueID;
    });
}

function getTreeMapData(issues) {
    let topLevelIssues = issues.filter((issue) => {
        return issue.parentID === null;
    });

    function makeNodes(_issues) {
        let result = []
        _issues.forEach(function (issue) {
            result.push({
                'name': issue.subject,
                'value': issue.totalSpentHours,
                'children': getChildIssues(issues, issue.issueID).length > 0 ? makeNodes(getChildIssues(issues, issue.issueID)) : []
            })
        })
        return result;
    }

    return makeNodes(topLevelIssues);
}

function treeMap(treeMapData) {
    function getLevelOption() {
        return [
          {
            itemStyle: {
              borderColor: '#777',
              borderWidth: 0,
              gapWidth: 1
            },
            upperLabel: {
              show: false
            }
          },
          {
            itemStyle: {
              borderColor: '#555',
              borderWidth: 5,
              gapWidth: 1
            },
            emphasis: {
              itemStyle: {
                borderColor: '#ddd'
              }
            }
          },
          {
            colorSaturation: [0.35, 0.5],
            itemStyle: {
              borderWidth: 5,
              gapWidth: 1,
              borderColorSaturation: 0.6
            }
          }
        ];
      }

    let option = {
        series: [
            {
                type: 'treemap',
                data: treeMapData,
                levels: getLevelOption(),
                label: {
                    show: true,
                    formatter: '{b}'
                },
                itemStyle: {
                    borderColor: '#fff'
                },
                upperLabel: {
                    show: true,
                    height: 30
                },
            }
        ],
        
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
              echarts.format.encodeHTML(treePath.join('/')) +
              '</div>',
            'time spent: ' + echarts.format.addCommas(value) + ' h'
          ].join('');
        }
      },
    };
    return option;
}
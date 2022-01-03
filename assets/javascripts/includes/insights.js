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


function getTimeSeriesData(timeEntries, issues, versions, avgInterval = 12) {
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
    result.avgLine = {};
    result.all = [];
    result.sum = [];
    result.markLineData = [];

    // make Lines
    topLevelIssues.forEach(function (issue) {
        let sum = 0;
        let valArr = [];
        let sumArr = [];
        let avgArr = [];
        let avgStarted = false;
        let avgCounter = 0;
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
            // add avg
            avgStarted = avgStarted || val > 0;
            if (avgStarted) {
                avgCounter += 1;
                avgArr.push(Math.round(movingAvg(valArr, Math.min(avgInterval, avgCounter))));
            } else {
                avgArr.push(0);
            }

            // add markline
            let version = versions.find(function (elm) { return elm.week == timeBeam[i].week && elm.year == timeBeam[i].year })
            if (version) {
                result.markLineData.push({
                    xAxis: i,
                    name: version.name
                })
            }
        }
        result.lines.push({ 'name': issue.subject, 'valArr': valArr, 'sumArr': sumArr, 'avgArr': avgArr })
    });

    // make overall avg

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
            avgArr.push(Math.round(movingAvg(sumArray, Math.min(avgInterval, counter))));
        } else {
            avgArr.push(0);
        }
    }
    result.avgLine = { 'name': 'avg ' + avgInterval + ' w', 'valArr': avgArr };

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

    // add avg line
    let avgLine = timeSeriesData.avgLine
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


    let option = {
        title: {
            text: 'hours per top level task'
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

function avgWeeklyHours(timeSeriesData) {
    let series = [];
    let legend = [];

    timeSeriesData.lines.forEach(function (line) {
        legend.push(line.name);
        series.push({
            name: line.name,
            type: 'line',
            stack: 'Total',
            data: line.avgArr,
            smooth: true,
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
    });

    let option = {
        title: {
            text: 'avg hours per top level task'
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
    }

    return option
}

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
            text: 'summed hours per top level task'
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

/***
 * Treemap
 */

function getTreeMapData(issues) {
    let topLevelIssues = issues.filter((issue) => {
        return issue.parentID === null;
    });

    function getChildIssues(issues, issueID) {
        return issues.filter((issue) => {
            return issue.parentID === issueID;
        });
    }

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

/***
 * User Radar
 */

 function findUsersForProject(timeEntries, users) {
    let userIDs = timeEntries.map(elm => { return elm.userID });
    let uniqueUserIDs = [...new Set(userIDs)];
    return users.filter(function (user) {
        return uniqueUserIDs.includes(user.userID)
    })
}

function getUserRadarData(timeEntries, issues, users) {
    const topLevelIssues = issues.filter((issue) => {
        return issue.parentID === null;
    });

    const angleAxis = topLevelIssues.map(elm => { return elm.subject });
    const uniqueUsers = findUsersForProject(timeEntries, users);
    let series = [];
    let legend = [];


    uniqueUsers.forEach(function(user){
        let serie = [];
        legend.push(user.userName);
        topLevelIssues.forEach(function (issue) {
            let relatedTimeEntries = timeEntries.filter(function (timeEntry) { return (timeEntry.topLevelID == issue.issueID && timeEntry.userID == user.userID) });
            let val = relatedTimeEntries.reduce(function (sum, current) { return sum + current.hours; }, 0);
            serie.push(val)
        })
        series.push({ 'name': user.userName, 'data': serie })
    })
    return { 'angleAxis': angleAxis, 'series': series, 'legend': legend }
}

function getUserRadarChart(userRadarData) {
    let series = [];
    let legend = [];
    userRadarData.series.forEach(function (serie) {
        legend.push(serie.name);
        series.push({
            type: 'bar',
            data: serie.data,
            coordinateSystem: 'polar',
            name: serie.name,
            stack: 'a',
            emphasis: {
                focus: 'series'
            }
        })
    })

    return {
        angleAxis: {
            type: 'category',
            data: userRadarData.angleAxis
        },
        radiusAxis: {},
        polar: {},
        series: series,
        legend: {
            show: true,
            data: legend
        }
    };

}
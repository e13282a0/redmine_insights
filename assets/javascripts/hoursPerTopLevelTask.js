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


function getTimeSeriesData(timeEntries, issues, versions, weeks = [52, 0], avgLines = []) {
    let topLevelIssues = issues.filter((issue) => {
        return issue.isTopLevel;
    });
    let timeBeam = getTimeBeam(weeks[0], weeks[1]);
    let result = {};
    result.legend = [];
    result.xAxis = timeBeam.map(elm => elm.week + '/' + elm.year)
    result.lines = [];
    result.avgLines = [];
    result.all = [];
    result.sum = [];
    result.markLineData = [];

    // make axis
    

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
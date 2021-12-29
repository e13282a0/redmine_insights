// Create Time Beam Array
function getTimeBeam(weeks) {
    let result = [];
    let runningDate = moment();
    for (let i = 0; i <= weeks; i++) {
        result.push({ week: runningDate.week(), year: runningDate.year() });
        runningDate = runningDate.subtract(7, "days");
    }
    return result.reverse();
}

// Calculate moving Average
function movingAvg(array, count) {
    const _count = Math.min(count, array.length) * -1;
    const arrayToSum = array.slice(_count);
    const avg = arrayToSum.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0) / arrayToSum.length;
    return avg;
}

// create Graph
function hoursPerTopLevelTask(timeEntries, issues, versions) {
    let topLevelIssues = issues.filter((issue) => {
        return issue.isTopLevel;
    });

    let series = [];
    let legend = [];
    let timeBeam = getTimeBeam(52);
    topLevelIssues.forEach(function (issue) {

        legend.push(issue.subject);

        // create hours beam and push it to column
        let hourBeam = timeBeam.map(function (elm) {
            relatedTimeEntries = timeEntries.filter(function (timeEntry) { return (timeEntry.topLevelID == issue.issueID && timeEntry.week == elm.week && timeEntry.year == elm.year) });
            elm = relatedTimeEntries.reduce(function (sum, current) { return sum + current.hours; }, 0);
            return elm;
        });
        series.push({
            name: issue.subject,
            type: 'line',
            stack: 'total',
            data: hourBeam
        })
    });

    // average lines for 4weeks and 12 weeks
    let started = false;
    let counter = 0;
    let sumArray = [];
    //let avg4Weeks = [];
    let avg12Weeks = [];
    let markLineData=[];
    for (let i = 0; i < timeBeam.length; i++) {
        relatedTimeEntries = timeEntries.filter(function (timeEntry) { return (timeEntry.week == timeBeam[i].week && timeEntry.year == timeBeam[i].year) });
        let weekSum = relatedTimeEntries.reduce(function (sum, current) { return sum + current.hours; }, 0);
        sumArray.push(weekSum);
        started = started || weekSum > 0;
        if (started) {
            counter += 1;
            //avg4Weeks.push(Math.round(movingAvg(sumArray, Math.min(4, counter))));
            avg12Weeks.push(Math.round(movingAvg(sumArray, Math.min(12, counter))));
        } else {
            //avg4Weeks.push(0);
            avg12Weeks.push(0);
        }
        // add markline
        let version = versions.find(function(elm) {return elm.week == timeBeam[i].week && elm.year == timeBeam[i].year})
        if (version) {
            markLineData.push({
                xAxis:i,
                name:version.name
            })
        }
    }
    // series.push({
    //     name: '4 week avg',
    //     type: 'line',
    //     data: avg4Weeks,
    //     smooth: true,
    //     lineStyle: {
    //         color: '#888888',
    //         width: 1,
    //         type: 'dashed'
    //     },
    // });
    // legend.push('4 week avg')
    series.push({
        name: '12 week avg',
        type: 'line',
        data: avg12Weeks,
        smooth: true,
        lineStyle: {
            color: '#000000',
            width: 1,
            type: 'dashed'
        },
        markLine: {
            symbol: ['none', 'none'],
            label: {
                formatter: '{b}',
                position: 'insideEndTop'
            },
            data: markLineData
        },
    });
    legend.push('12 week avg');
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
            data: getTimeBeam(52).map(elm => elm.week + '/' + elm.year)
        },
        yAxis: {
            type: 'value'
        },
        series: series
    };
    return option;
}
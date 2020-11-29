const fs = require('fs').promises;
const path = require('path');

let loc = l => ({
	'PV':'Village Center',
	'PK':'Kendall',
	'PE':'Eolus',
	'VA':'Purgatory Lodge',
	'PP':'Peregrine Point',
	'CSV':'Cascade Village'}[l] || l);

let tCol = [
	['name',18,53],
	['name',54,99],
	['room',437,443],
	['phone',326,338],
	['date',443,451],
	['date',451,459]];

let colFuncs = {
	'name': n => n,
	'phone': p => p
		.replace(/[\-\."]/g,'')
		.replace(/^1\d{10}/, p => p.slice(1)),
	'room': r => [loc(r.match(/\D+/)),r.match(/\d+/)].join(' '),
	'date': d => [[4,-2],[6],[,4]]
		.map(range => ''.slice.apply(d, range))
		.join('/')};

let colMask = n => ~~((n-2)/Math.abs(n-2))+1;

let readReport = report => report
	.split('\n')
	.map(line => tCol.map(([_,start,end]) => line.slice(start,end).trim()));

let parseData = rData => rData
	.map(line => tCol.map(([f],i) => colFuncs[f](line[i])));

let dateRange = report => report.reduce((dates,guest) =>
		[[...dates[0],guest[4]],[...dates[1],guest[5]]],[[],[]]); 

let dRange = dates =>
	[Math.min.apply(null,dates[0]), Math.max.apply(null,dates[1])]
		.map(d => new Date([[,4],[4,-2],[6]]
			.map(range => ''.slice.apply(d+'', range))
			.join('-')));

let days = ([start,end]) =>
	start < end ?
		[start,...days([nextDay(start),end])] :
		[end];

let nextDay = date => new Date(new Date(date).setDate(date.getDate()+1));

let formatDays = days =>
	days.map(day => day.toLocaleString().split(',')[0])

let splitByDays = (days, cData) => 
	[l => l[3], l => l[4]].map(f =>
		days.map(day =>
			cData
				.filter(line => day == f(line)))
			.filter(day => day[0]));

module.exports = async ([reportPath,outputFolder]) => {
	let report = await fs.readFile(reportPath, 'utf-8').catch(e => e);
	let rData = readReport(report);
	let cData = parseData(rData);
	let dates = dateRange(rData);
	let daysList = days(dRange(dates));
	let splitReport = splitByDays(formatDays(daysList),cData);

	// console.log(cData);
	// console.log(dates);
	// console.log(daysList);
	// console.log(splitReport);
  // console.log(reportPath);
  // console.log(outputFolder);

	['arrival','departure'].map((set,i) =>
		splitReport[i]
			.map(day =>
        fs.writeFile(path.join(outputFolder, `${day[0][3+i].replace(/\//g,'-')} ${set}.csv`),
          day.map(l => l.join(',')).join('\n'))));
};

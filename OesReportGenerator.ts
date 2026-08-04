// Order Execution Summary (OES) Report Generator was created by staff of the U.S. Securities and Exchange Commission.
// Data and content created by government employees within the scope of their employment
// are not subject to domestic copyright protection. 17 U.S.C. 105.

"use strict";

import * as Papa from "papaparse";
import pdfMake from "./pdfmake.js";

const NS = ''; /* null string */
const WS = ' '; /* one whitespace */
const NL: string = "\n";
const TEXTSIZE = 7;
const FILLCOLOR = '#CCE6FF'; /* blue */
// const FAILCOLOR = '#FFCCE6'; /* pink */
const FAILTEXTCOLOR = '#FF0000' /* red */
const TITLE = 'Order Execution Summary Data Report';
const MINCOLWIDTH = (2.2 * TEXTSIZE) | 0;
var FILE: File;
var CsvContent: Papa.ParseResult<{ meta: Papa.ParseMeta, data: {}[], errors: Papa.ParseError[], messages?: string[] }>;
var CsvMessages: string[] = [];
var csvDoc: { getElementsByTagName: (arg0: any) => any; };
const DISCLAIMER: string = "THIS DOCUMENT IS A TECHNICAL ILLUSTRATION OF HOW CERTAIN DISCLOSURES REQUIRED BY THE SEC ARE TO BE STRUCTURED. IT DOES NOT INDICATE WHICH PARTICULAR DISCLOSURES MUST BE REPORTED AND/OR STRUCTURED, AND IT DOES NOT CONSTITUTE LEGAL GUIDANCE OF ANY SORT."

var SchemaContent: {
	'@context': string,
	'rdfs:comment'?: string[],
	dialect?: {},
	tables:
	{
		tableSchema:
		{
			primaryKey?: string[],
			columns:
			{
				name: string,
				"rdfs:comment"?: {}[]
				type?: string,
				null?: string | string[],
				nulls?: string[], /* property added by code below */
				regex?: RegExp, /* ditto */
				regex_message?: string /* ditto */
				required?: boolean,
				datatype?: { base: string, format?: string, minimum?: number, maximum?: number, exclusiveMinimum?: number, exclusiveMaximum?: number },
				titles?: string[],
				"dc:description": string
			}[]
		}
	}[]
} = { /* default schema not normally embedded in code */
	"@context": "http://www.w3.org/ns/csvw#",
	"rdfs:comment": [
		"This schema was created by staff of the U.S. Securities and Exchange Commission. Data and content created by government employees within the scope of their employment are not subject to domestic copyright protection. 17 U.S.C. 105."
	],
	"dialect": {
		"header": true,
		"headerRowCount": 1,
		"delimiter": ","
	},
	"tables": [
		{
			"tableSchema": {
				"primaryKey": [
					"DsgntParticipant",
					"RprtEntityCd",
					"RptDate",
					"Sp500",
					"OrderType",
					"OrderSize"
				],
				"columns": [
					{
						"name": "DsgntParticipant",
						"rdfs:comment": [{ "=fc": 1 }],
						"required": true,
						"datatype": {
							"base": "token",
							"format": "^[A-Z]+$"
						},
						"titles": [
							"Designated Participant"
						],
						"dc:description": "The code identifying the Participant that is acting as Designated Participant for the market center, broker, or dealer, as follows: A: NYSE American, Z: BZX, Y: BYX, B: Nasdaq BX, M: NYSE Texas, C: NYSE National, J: EDGA, K: EDGX, Q: NASDAQ, T: FINRA, N: NYSE, P: NYSE ARCA, X: Nasdaq PSX, V: IEX, L: LTSE, H: MIAX, U: MEMX, G: 24X, F: TXSE."
					},
					{
						"name": "RprtEntityCd",
						"rdfs:comment": [{ "=fc": 2 }],
						"type": "string",
						"required": true,
						"datatype": {
							"base": "token",
							"format": "^[A-Z]+$"
						},
						"titles": [
							"Market Center, Broker, or Dealer Code"
						],
						"dc:description": "The code identifying the market center, broker, or dealer, as assigned by a Designated Participant"
					},
					{
						"name": "RptDate",
						"rdfs:comment": [{ "=fc": 3 }],
						"required": true,
						"datatype": {
							"base": "int",
							"format": "^20[2-9]\\d(0[1-9]|1[012])$",
							"minimum": 202501,
							"exclusiveMaximum": 209913
						},
						"titles": [
							"Report Date"
						],
						"dc:description": "Six-digit code YYYYMM identifying the calendar month of trading for the market center, broker's or dealer's report contained in the table"
					},
					{
						"name": "Sp500",
						"rdfs:comment": [],
						"datatype": {
							"base": "token",
							"format": "Y|N"
						},
						"required": true,
						"titles": [
							"S&P 500 Flag"
						],
						"dc:description": "Y: NMS stocks that are included in the S&P 500 Index as of the first day of that month; N: other NMS stocks"
					},
					{
						"name": "OrderSize",
						"rdfs:comment": [{ "=fc": 6 }],
						"datatype": {
							"base": "token",
							"format": "^(0|250|1000|5000|10000|20000|50000|199999|200000)$"
						},
						"required": true,
						"titles": [
							"Order Size (USD)"
						],
						"dc:description": "0: less than $250; 250: $250 to less than $1,000, 1000: $1,000 to less than $5,000; 5000: $5,000 to less than $10,000, 10000: $10,000 to less than $20,000; 20000: $20,000 to less than $50,000; 50000: $50,000 to less than $200,000; 200000: $200,000 or more; 199999: all order sizes combined, excluding orders with a notional value of $200,000 or more"
					},
					{
						"name": "OrderType",
						"rdfs:comment": [{ "=fc": 7 }],
						"required": true,
						"datatype": {
							"base": "token",
							"format": "M|ML"
						},
						"titles": [
							"Order Type"
						],
						"dc:description": "M: market orders; ML: marketable limit orders. Exclude other order types, e.g. IOC, FOK."
					},
					{
						"name": "AvgOrderQty",
						"rdfs:comment": [{ "~fc": 10 }],
						"datatype": {
							"base": "float",
							"minimum": 0.0,
							"format": "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$"
						},
						"required": true,
						"titles": [
							"Average Order Size (Shares)"
						],
						"dc:description": "(i) The average order size in shares"
					},
					{
						"name": "AvgOrderSize",
						"rdfs:comment": [{ "~fc": 9 }],
						"required": true,
						"datatype": {
							"base": "float",
							"minimum": 0.0,
							"format": "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$"
						},
						"titles": [
							"Average Notional Order Size (USD)"
						],
						"dc:description": "(ii) The average notional order size"
					},
					{
						"name": "ExctdOrderMidPtAvg",
						"rdfs:comment": [{ "=fc": 32 }],
						"required": true,
						"datatype": {
							"base": "float",
							"format": "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$"
						},
						"titles": [
							"Share-weighted Average Midpoint (USD)"
						],
						"dc:description": "(iii) For executions of covered orders, the average midpoint"
					},
					{
						"name": "PctExctdAtQuotOrBetter",
						"rdfs:comment": [],
						"required": true,
						"datatype": {
							"base": "float",
							"minimum": 0.0,
							"maximum": 1.0,
							"format": "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$"
						},
						"titles": [
							"% Shares Executed at Quote or Better"
						],
						"dc:description": "(iv) For executions of covered orders, the percentage of shares executed at the quote or better"
					},
					{
						"name": "PctExctdPI",
						"rdfs:comment": [{ "~fc": 37 }],
						"required": true,
						"datatype": {
							"base": "float",
							"minimum": 0.0,
							"maximum": 1.0,
							"format": "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$"
						},
						"titles": [
							"% Shares Executed with Price Improvement"
						],
						"dc:description": "(v) For executions of covered orders, the percentage of shares that received price improvement"
					},
					{
						"name": "WghtdAvgPctPI",
						"rdfs:comment": [{ "~fc": 38 }],
						"required": true,
						"datatype": {
							"base": "float",
							"maximum": 2.0,
							"format": "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$"
						},
						"titles": [
							"Share-weighted Average % Price Improvement"
						],
						"dc:description": "(vi) For executions of covered orders, the share-weighted average percentage price improvement, calculated as the cumulative amount that prices were improved less the cumulative amount that prices were executed outside the quote divided by sum of the average midpoint times the number of shares executed"
					},
					{
						"name": "AvgEffctvSprdPct",
						"rdfs:comment": [{ "=fc": 35 }],
						"required": true,
						"datatype": {
							"base": "float",
							"minimum": -2.0,
							"format": "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$"
						},
						"titles": [
							"Average % Effective Spread"
						],
						"dc:description": "(vii) For executions of covered orders, the average percentage effective spread (-1.0 to 1.0)"
					},
					{
						"name": "AvgPctQuotSprd",
						"required": true,
						"datatype": {
							"base": "float",
							"minimum": 0.0,
							"format": "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$"
						},
						"titles": [
							"Average % Quoted Spread"
						],
						"dc:description": "(viii) For executions of covered orders, the average percentage quoted spread, calculated as the average quoted spread divided by the average midpoint for such orders (-1.0 to 1.0)"
					},
					{
						"name": "AvgEFQPct",
						"required": true,
						"null": ["", "nan", "NaN", "inf", "+inf", "-inf"],
						"datatype": {
							"base": "float",
							"format": "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$"
						},
						"titles": [
							"Average Effective / Average Quoted Spread %"
						],
						"dc:description": "(ix) For executions of covered orders, the average effective spread divided by the average quoted spread, expressed as a percentage"
					},
					{
						"name": "AvgRealSprdPct15sec",
						"required": true,
						"null": ["", "nan", "NaN", "inf", "+inf", "-inf"],
						"datatype": {
							"base": "float",
							"format": "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$"
						},
						"titles": [
							"Average % Realized Spread after 15 Seconds"
						],
						"dc:description": "(x) For executions of covered orders, the average percentage realized spread as calculated 15 seconds after the time of execution"
					},
					{
						"name": "AvgRealSprdPct1min",
						"required": true,
						"datatype": {
							"base": "float",
							"format": "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$"
						},
						"titles": [
							"Average % Realized Spread after 1 Minute"
						],
						"dc:description": "(xi) For executions of covered orders, the average percentage realized spread as calculated 1 minute after the time of execution"
					},
					{
						"name": "WghtdAvgExctnTime",
						"required": true,
						"datatype": {
							"base": "float",
							"minimum": 0,
							"format": "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$"
						},
						"titles": [
							"Share-weighted Average Execution Speed (msec)"
						],
						"dc:description": "(xii) For executions of covered orders, the share-weighted average execution speed, in milliseconds"
					}
				]
			}
		}
	]
}

const DP_NAME: { [key: string]: string } = {
	"A": "NYSE American", "Z": "BZX", "Y": "BYX", "B": "Nasdaq BX", "M": "NYSE Texas", "C": "NYSE National", "J": "EDGA", "K": "EDGX", "Q": "NASDAQ", "T": "FINRA", "N": "NYSE", "P": "NYSE ARCA", "X": "Nasdaq PSX", "V": "IEX", "L": "LTSE", "H": "MIAX", "U": "MEMX", "G": "24X", "F": "TXSE"
}

const ORDER_TYPES = ["MXXNN", "LYNNN"]
const YN = ["Y", "N"]

const REGEX_MESSAGE: { [key: string]: string } = {
	"MXXNN|LYNNN": "one of " + ORDER_TYPES.join(" or ")
	, "Y|N": "one of " + YN.join(" or ")
	, "^(0|250|1000|5000|10000|20000|50000|199999|200000)$": "one of 0, 250, 1000, 5000, 10000, 20000, 50000, 199999, or 200000"
	, "^[+-]?(\\d+(\\.\\d{0,6})?([eE][+-]?\\d+)?)?$": "a signed or unsigned number of up to six decimal places"
	, "^[A-Z]+$": "a string of uppercase letters"
	, "^20[2-9]\\d(0[1-9]|1[012])$": "a month YYYYMM from 202001 to 209912 inclusive"
}

const ORDER_SIZES: { [key: string]: string } = {
	"0": "Under $250",
	"250": "$250 - $1K",
	"1000": "$1K - $5K",
	"5000": "$5K - $10K",
	"10000": "$10K - $20K",
	"20000": "$20K - $50K",
	"50000": "$50K - $200K",
	"199999": "All Under $200K",
	"200000": "$200K & Over"
}

const NUMBER_STYLE: { [key: string]: Intl.NumberFormat } = { // currency is USD, format requires at least 2 fraction digits
	"$2": new Intl.NumberFormat("en-US", { "style": "currency", "currency": "USD", "minimumFractionDigits": 2, "maximumFractionDigits": 2 })
	, "$4": new Intl.NumberFormat("en-US", { "style": "currency", "currency": "USD", "minimumFractionDigits": 4, "maximumFractionDigits": 4 })
	, "%2": new Intl.NumberFormat("en-US", { "style": "percent", "minimumFractionDigits": 2, "maximumFractionDigits": 2 })
	, "%4": new Intl.NumberFormat("en-US", { "style": "percent", "minimumFractionDigits": 4, "maximumFractionDigits": 4})
	, "2": new Intl.NumberFormat("en-US", { "style": "decimal", "minimumFractionDigits": 2, "maximumFractionDigits": 2 })
	, "3": new Intl.NumberFormat("en-US", { "style": "decimal", "minimumFractionDigits": 3, "maximumFractionDigits": 3 })
	, "4": new Intl.NumberFormat("en-US", { "style": "decimal", "minimumFractionDigits": 4, "maximumFractionDigits": 4 })
	, "6": new Intl.NumberFormat("en-US", { "style": "decimal", "minimumFractionDigits": 6, "maximumFractionDigits": 6 })
}

const SPECIAL_FORMAT: { [key: string]: CallableFunction } = {
	"OrderType":
		function (x: string) { 
			return x;
		}
	, "OrderSize":
		function (x: string) {
			if (x in ORDER_SIZES) {
				return ORDER_SIZES[x];
			} else {
				return x;
			}
		}
	, "RptDate":
		function (x: number) {
			return `${x.toString().substring(4, 6)}/${x.toString().substring(0, 4)}`
		}
}

function createOrderExecutionSummaryReportPDF() {
	var docStyles = {
		header: { fontSize: TEXTSIZE * 2, bold: true, alignment: 'center' },
		header3: { fontSize: TEXTSIZE + 2, bold: true, alignment: 'center', lineHeight: 1.2 },
		header4: { fontSize: TEXTSIZE, bold: true, alignment: 'center', lineHeight: 1.2 },
		sectionHeader: { fontSize: TEXTSIZE + 4, bold: true, alignment: 'left', lineHeight: 1.2 },
		subSectionHeader: { fontSize: TEXTSIZE + 2, bold: true, alignment: 'left', lineHeight: 1.2 },
		textStyle: { fontSize: TEXTSIZE, alignment: 'left' },
		tableHeader: { fontSize: TEXTSIZE, bold: false, alignment: 'center', fillColor: FILLCOLOR },
		tableValue: { fontSize: TEXTSIZE, alignment: 'left' },
		tableNameValue: { fontSize: TEXTSIZE, alignment: 'left' },
		failHeader: { fontSize: TEXTSIZE + 1, bold: true, alignment: 'left', color: FAILTEXTCOLOR },
		failText: { fontSize: TEXTSIZE, alignment: 'left', color: FAILTEXTCOLOR }
	}

	var whole_body = getOesData();
	var hasoutput = whole_body.length > 0;
	if (!hasoutput) {
		console.log('No data in ' + FILE.name + ', no output files.');
	}
	const outname = ((FILE == null || FILE.name == undefined) ? 'OrderExecution' : removeExtension(FILE.name));
	const docDefinition = {
		info:
		{
			title: TITLE,
			PageLayout: 'OneColumn'
		},
		content: whole_body,
		pageOrientation: 'landscape',
		styles: docStyles
	};
	const pdf = pdfMake.createPdf(docDefinition);
	pdf.download(outname + '.pdf')
}

const OeFirstPage = [
	['DsgntParticipant', 'left', 'Designated Participant'],
	['RprtEntityCd', 'left', 'Reporting Entity Code'],
	['RptDate', 'left', 'Report Date']
];
const OeFirstPageElts: string[] = [];
for (var i = 0; i < OeFirstPage.length; i++) { OeFirstPageElts.push(OeFirstPage[i][0]); }
const OeFirstPageAlign = [];
for (var i = 0; i < OeFirstPage.length; i++) { OeFirstPageAlign.push(OeFirstPage[i][1]); }
const OeFirstPageHeaders: string[] = [];
for (var i = 0; i < OeFirstPage.length; i++) { OeFirstPageHeaders.push(OeFirstPage[i][2]); }

const OeLastPage: string[] = [];
const OeLastPageElts: string[] = [];
for (var i = 0; i < OeLastPage.length; i++) { OeLastPageElts.push(OeLastPage[i][0]); }
const OeLastPageAlign = [];
for (var i = 0; i < OeLastPage.length; i++) { OeLastPageAlign.push(OeLastPage[i][1]); }
const OeLastPageHeaders = [];
for (var i = 0; i < OeLastPage.length; i++) { OeLastPageHeaders.push(OeLastPage[i][2]); }

function NL_repeat(n: number): string {
	return Array(n + 1).join(NL);
}

const OeTable = [ /*  name, alignment, width, pretty name, format code.  ORDER is significant.  570.  */
	/* pretty name has newlines because package does not support vertical-alignment. */
	// ['DsgntParticipant', 'center', 2*MINCOLWIDTH, NL_repeat(2) + 'Desig- nated Partic- ipant', null],
	// ['RprtEntityCd', 'center', 2*MINCOLWIDTH, NL_repeat(0) + 'Reporting Entity Code', null],
	// ['RptDate', 'center', 2*MINCOLWIDTH, NL_repeat(4) + 'Report Date', 'special'],
	['Sp500', 'center', 1 * MINCOLWIDTH, NL_repeat(3) + 'S&P 500 Flag', null],
	['OrderSize', 'center', 4 * MINCOLWIDTH, NL_repeat(5) + 'Order Size (USD)', 'special'],
	['OrderType', 'center', 3 * MINCOLWIDTH, NL_repeat(3) + 'Order Type (M-Mkt; ML-Mktbl Lmt)', 'special'],
	['AvgOrderQty', 'right', 3 * MINCOLWIDTH, NL_repeat(4) + 'Average Order Size (Shares)', "2"],
	['AvgOrderSize', 'right', 3 * MINCOLWIDTH, NL_repeat(2) + 'Average Notional Order Size (USD)', "$2"],
	['ExctdOrderMidPtAvg', 'right', 3 * MINCOLWIDTH, NL_repeat(2) + 'Share-weighted Average Midpoint', "$2"],
	['PctExctdAtQuotOrBetter', 'right', 2 * MINCOLWIDTH, NL_repeat(2) + '% Shares Executed at Quote or Better', "%2"],
	['PctExctdPI', 'right', 3 * MINCOLWIDTH, NL_repeat(2) + '% Shares Executed with Price Improvement', "%2"],
	['WghtdAvgPctPI', 'right', 3 * MINCOLWIDTH, NL_repeat(1) + 'Share-weighted Average % Price Improvement', "%4"],
	['AvgEffctvSprdPct', 'right', 3 * MINCOLWIDTH, NL_repeat(3) + 'Average % Effective Spread', "%4"],
	['AvgPctQuotSprd', 'right', 3 * MINCOLWIDTH, NL_repeat(3) + 'Average % Quoted Spread', "%4"],
	['AvgEFQPct', 'right', 2 * MINCOLWIDTH, NL_repeat(1) + 'Average Effective / Average Quoted Spread %', "%2"],
	['AvgRealSprdPct15sec', 'right', 3 * MINCOLWIDTH, NL_repeat(2) + 'Average % Realized Spread after 15 Seconds', "%4"],
	['AvgRealSprdPct1min', 'right', 3 * MINCOLWIDTH, NL_repeat(2) + 'Average % Realized Spread after 1 Minute', "%4"],
	['WghtdAvgExctnTime', 'right', 3 * MINCOLWIDTH, NL_repeat(1) + 'Share- weighted Average Execution Speed (msec)', "3"]
];
const OeCols = OeTable.length;
const OeElts: string[] = [];
for (var i = 0; i < OeTable.length; i++) { OeElts.push(<string>OeTable[i][0]); }
const OeAlign: string[] = [];
for (var i = 0; i < OeTable.length; i++) { OeAlign.push(<string>OeTable[i][1]); }
const OeWidths: number[] = [];
for (var i = 0; i < OeTable.length; i++) { OeWidths.push(<number>OeTable[i][2]); }
const OeHeaders: string[] = [];
for (var i = 0; i < OeTable.length; i++) { OeHeaders.push(<string>OeTable[i][3]); }
const OeFormats: string[] = [];
for (var i = 0; i < OeTable.length; i++) { OeFormats.push(<string>OeTable[i][4]); }

function getOesData() { /* main */
	const schemaCols = SchemaContent.tables[0].tableSchema.columns;
	const data = <{ [key: string]: any }[]>CsvContent.data
	let partitions: [string, string, string, { [key: string]: string }[]][] = [];
	// partition all the rows by Designated Participant, Reporter Code, and Month
	data.forEach((rowObject, jj) => {
		let k0 = rowObject.DsgntParticipant;
		let k1 = rowObject.RprtEntityCd;
		let k2 = rowObject.RptDate;
		let partition = partitions.find(p => {
			return (p[0] == k0 && p[1] == k1 && p[2] == k2);
		});
		if (partition === undefined) {
			partition = [k0, k1, k2, []]
			partitions.push(partition)
		}
		rowObject['orig'] = String(jj + 1); // errors are reported with first data row as row 1
		partition[3].push(rowObject);
	});
	let whole_body: (string | object)[] = [];
	partitions.forEach(partition => {
		let preamble: { 'text': string, 'style': string, 'tags'?: string[], pageBreak?: string }[] = [];
		preamble.push({
			text: TITLE,
			style: 'header',
			tags: ['TITLE', '/TITLE'],
			pageBreak: ((whole_body.length === 0) ? 'none' : 'before')
		});
		const k0: string = (partition[0] in DP_NAME) ? DP_NAME[partition[0]] : partition[0];
		const k1: string = partition[1];
		const k2: string = SPECIAL_FORMAT["RptDate"](partition[2]);
		
		if (k0=="SAMPLE" || k1=="SAMPLE" || k1=="NGOOD") {
			preamble.push({ text: DISCLAIMER, style: 'failHeader', tags: ['H2','/H2']})
		}
		
		preamble.push({ text: `Designated Participant: ${k0}`, style: 'sectionHeader', tags: ['H2', '/H2'] })
		preamble.push({ text: `Reporting Entity: ${k1}`, style: 'sectionHeader', tags: ['H2', '/H2'] })
		preamble.push({ text: `Month: ${k2}`, style: 'sectionHeader', tags: ['H2', '/H2'] })

		const lastCol = OeCols - 1;
		var body = [];
		var row: object[] = [];
		const OeRows = partition[3];
		const lastRow = OeRows.length - 1;

		const rownum_regex = RegExp("^R(?<rownum>[0-9]+)(?<colnum>C[0-9]+)?[:,].*");
		let is_explained = false;
		CsvMessages.forEach(message => { // TODO: partition the error messages, too
			let found = message.match(rownum_regex);
			let rnum: string = (!!found && found.groups) ? found.groups["rownum"] : "";
			if (!!rnum) {
				let is_row_here = OeRows.find(r => { return rnum == r["orig"] });
				if (!!is_row_here) {
					if (!is_explained) {
						preamble.push({ text: "Input CSV file generated messages at R(ow)C(olumn):", style: 'failHeader', tags: ['P', '/P'] });
						is_explained = true;
					}
					preamble.push({ text: message, style: 'failText', tags: ['P', '/P'] });
				};
			};
		});



		OeHeaders.forEach((val, i) => {
			const isFirstCol: boolean = (i == 0);
			const isLastCol: boolean = (i == lastCol);
			row.push({
				text: val,
				tags: (<string[]>[])
					.concat(isFirstCol ? ['Table', 'TR'] : [])
					.concat(['TH', '/TH'])
					.concat(isLastCol ? ['/TR'] : []),
				style: 'tableHeader', unbreakable: true
			});
		});
		body.push(row);
		partition[3].forEach((rowObject, i) => {
			const row: {}[] = [];
			const isLastRow = (i == lastRow);
			schemaCols.forEach((col, jj) => { // jj is the data column, j is display column
				let j = jj - 3;
				const name = col.name;
				if (OeElts.indexOf(name) != -1) { // must be an actual displayed column
					let content: string = "";
					const isFirstCol = (j == 0);
					const isLastCol = (j == lastCol);
					if (name in rowObject) {
						content = rowObject[name]
						if (String(content).length > 0) {
							const numberFormat = OeFormats[j];
							if (numberFormat in NUMBER_STYLE && isFinite(Number(content))) {
								content = NUMBER_STYLE[numberFormat].format(Number(content));
							} else if (numberFormat == "special") {
								content = SPECIAL_FORMAT[name](content);
							}
						} else {
							content = WS; /* really empty cells aren't handled by the pdfMake with tagging code */
						}
					}
					row.push({
						text: content,
						tags: (<string[]>[])
							.concat(isFirstCol ? ['TR'] : [])
							.concat(['TD', '/TD'])
							.concat(isLastCol ? ['/TR'] : [])
							.concat(isLastCol && isLastRow ? ['/Table'] : []),
						style: 'tableValue',
						unbreakable: true,
						alignment: OeAlign[j]
					});
				};
			});
			body.push(row);
		});

		const postamble: {}[] = [];
		OeLastPage.forEach(val => {
			const tag = val[0];
			const align = val[1];
			const label = val[2];
			const elts = csvDoc.getElementsByTagName(tag);
			if (elts.length > 0) {
				var content = elts[0].textContent.trim();
				if (OeLastPageElts.indexOf(elts[0].localName) >= 0) {
					postamble.push({
						text: label, style: 'sectionHeader', tags: ['H2', '/H2']
					});
					var content = elts[0].textContent.trim();
					postamble.push({
						text: content, style: 'textStyle', tags: ['P', '/P']
					});
				}
			}
		});

		var main_table = {
			table: {
				body: body,
				headerRows: 1,
				dontBreakRows: true,
				widths: OeWidths
			}
		};

		whole_body = whole_body.concat([preamble, NL, main_table, NL, postamble]);
	})

	return whole_body;
}

//function formatDate(timestamp: string) {
//	const date = new Date(timestamp);
//	return date.toString();
//}

function removeExtension(filename: string) {
	const lastDotPosition = filename.lastIndexOf(".");
	if (lastDotPosition === -1) { return filename; }
	else { return filename.substring(0, lastDotPosition); }
}
//
//function loadSchema() { /* from button only */
//	const elt = <HTMLInputElement>document.getElementById('schemaFile')
//	const oFiles = <File[]>((elt.files == null) ? [] : elt.files[0]);
//	try {
//		var reader = new FileReader();
//		reader.readAsText(oFiles[0]);
//		reader.onloadend = function() {
//			SchemaContent = JSON.parse(String(reader.result));
//			prepareSchema();
//		};
//	} catch (err) {
//		alert(err);
//	}
//}


function prepareSchema() { /* each time it's about to be used */
	const schemaCols = SchemaContent.tables[0].tableSchema.columns;
	schemaCols.forEach(column => {
		if (column.datatype != undefined && column.datatype.format != undefined) {
			// cast the format to a regex
			const format = column.datatype.format;
			column["regex"] = new RegExp(format);
			// English error message
			const regex_message = REGEX_MESSAGE[format];
			column["regex_message"] = ((regex_message == undefined) ? "a match for " + format : regex_message);
		}
		const nullProperty = column.null;
		column.nulls = [];
		switch (typeof (nullProperty)) {
			/* cast the null Property to an (maybe empty) array of strings. */
			case "string":
				column.nulls = [nullProperty];
				break;
			default:
				if (Array.isArray(nullProperty)) {
					column.nulls = nullProperty;
				}
		};
	});
}


export default function loadCsv() { /* invoked only from the button */
	var oFiles = (<HTMLInputElement>document.getElementById('csvFile')).files;
	try {
		if (oFiles == null || oFiles.length == 0) {
			return
		}
		var reader = new FileReader();
		FILE = oFiles[0];
		reader.readAsText(FILE);
		reader.onloadend = function () {
			// document.getElementById('ready').innerHTML = "Busy";
			let CsvText = <string>reader.result;
			CsvContent = Papa.parse(CsvText,
				{
					"header": true
					, "skipEmptyLines": true
				})
			var CsvMessages = [];
			const errors = CsvContent.errors;
			errors.forEach(error => {
				CsvMessages.push(`R${error.row}: ${error.type} ${error.code} ${error.message}`);
			});
			validateCsvContent();
			// meta.messages.forEach(str => {
			// 	console.log(str);
			// })
			if (CsvMessages.length > 0) {
				alert(`Output PDF for ${FILE.name} will show ${CsvMessages.length} errors.`)
			}
			createOrderExecutionSummaryReportPDF();
			// document.getElementById('ready').innerHTML = "Ready";
		};
	} catch (err) {
		alert(err);
	}
}

function get_number_from(key: string, these: { [key: string]: any }, otherwise: number): number {
	// guaranteed number from an object, or value of 'otherwise'
	if (!(key in these)) {
		return otherwise;
	}
	const the_value = these[key];
	if (isNaN(the_value)) {
		return otherwise;
	}
	return Number.parseFloat(the_value);
}


function validateCsvContent() {
	prepareSchema();
	const meta = CsvContent.meta;
	const hdrFields = meta.fields;
	const tableSchema = SchemaContent.tables[0].tableSchema;
	const schemaCols = tableSchema.columns;
	if (hdrFields != undefined && schemaCols.length != hdrFields.length) {
		CsvMessages.push("Mismatched header and columns lengths");
	}
	if (tableSchema.primaryKey == undefined) return;
	const primary_key = tableSchema.primaryKey;
	const primary_key_array = Array.isArray(primary_key) ? primary_key : Array(primary_key);
	const key_prev_row: { [key: string]: number } = {};
	const data = CsvContent.data;
	data.forEach((row: {}, i) => {
		const key: string[] = [];
		const key_token = key.join("~");
		if (key_token in key_prev_row) {
			CsvMessages.push(`R${key_prev_row[key_token]}, R${i + 1}: Duplicate primary key ${key}`)
		} else {
			key_prev_row[key_token] = i;
		}
		schemaCols.forEach((col, j) => {
			const value = validated_string(i, j, row, col);
			if (primary_key_array.indexOf(col.name) > 0) {
				key.push(value);
			}
		});
	});
}


function validated_string(i: number, j: number,
	row: { [key: string]: string | number },
	col: {
		name: string,
		nulls?: string[],
		regex?: RegExp,
		regex_message?: string,
		datatype?: { format?: string }
	}) {
	/* always returns a string */
	const name: string = col.name;
	const value: string | number = row[name];
	const format = (col.datatype == undefined || col.datatype.format == undefined) ? "*" : col.datatype?.format;
	const nulls = (col.nulls == undefined) ? [] : col.nulls;
	if (value === undefined && nulls.length === 0) {
		CsvMessages.push(`R${i + 1}C${j + 1}: ${name} missing`);
		return "missing";
	} else if (value === null && nulls.length === 0) {
		CsvMessages.push(`R${i + 1}C${j + 1}: ${name} does not allow nulls`);
		return "null";
	} else {
		let rgx = (col.regex == undefined) ? ".*" : col.regex;
		switch (typeof (value)) {
			case "string":
				if (!value.match(rgx)) {
					const blank = (value === NS) ? "empty - " : NS;
					const msg = `R${i + 1}C${j + 1}: ${name} '${value}' is ${blank}not ${col.regex_message}`;
					CsvMessages.push(msg);
				};
				return value;
			case "number":
				const valString = value.toString();
				if (value != parseFloat(valString)) {
					const msg = `R${i + 1}C${j + 1}: ${name} '${valString}' not equal to ${value}, could be an issue`;
					CsvMessages.push(msg);
				}
				if (!valString.match(rgx)) {
					const msg = `R${i + 1}C${j + 1}: ${name} '${value}' does not appear to match ${format}`;
					CsvMessages.push(msg);
				};
				return valString;
			default:
				return typeof (value);
		}
	}
}

export { };
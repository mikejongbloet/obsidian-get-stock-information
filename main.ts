import { Editor, Plugin, Notice } from "obsidian";
import { InsertLinkModal } from "./modal";

const yahooStockAPI = require("yahoo-stock-api").default;
const yahoo = new yahooStockAPI();
export default class StockInfoPlugin extends Plugin {
	async onload() {
		console.log("reloaded");

		// Add command to Obsidian quick tasks

		this.addCommand({
			id: "insert-stock-info",
			name: "Insert stock info",
			editorCallback: (editor: Editor) => {
				// get selected text
				const selectedText = editor.getSelection();

				// onSubmit of the form
				const onSubmit = async (ticker: string) => {
					// helper function: format a long number into millions or billions
					const formatLongNumber = (n: number) => {
						if (n < 1e9) return +(n / 1e6).toFixed(3) + "M";
						if (n >= 1e9 && n < 1e12)
							return +(n / 1e9).toFixed(3) + "B";
						if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
					};

					// helper function: check if a given date = today
					const isToday = (someDate: Date) => {
						const today = new Date();
						return (
							someDate.getDate() == today.getDate() &&
							someDate.getMonth() == today.getMonth() &&
							someDate.getFullYear() == today.getFullYear()
						);
					};

					// create object to store stock return values
					let stock: { [key: string]: any } = {};

					// async function callHistoricalPrices(ticker: string) {
					// 	try {
					// 		const startDate: Date = new Date();
					// 		const endDate: Date = new Date();

					// 		// begin async call for historical prices
					// 		return yahoo.getHistoricalPrices({
					// 			startDate,
					// 			endDate,
					// 			symbol: ticker,
					// 			frequency: "1d",
					// 		});
					// 	} catch (e) {
					// 		console.error("An error occurred:", e);
					// 		new Notice(
					// 			"Error: couldn't retrieve stock information",
					// 			15000
					// 		);
					// 	}
					// }

					async function callCurrentPrices(ticker: string) {
						try {
							return yahoo.getSymbol({
								symbol: ticker,
							});
						} catch (e) {
							console.error("An error occurred:", e);
							new Notice(
								"Error: couldn't retrieve stock information",
								15000
							);
						}
					}

					// await the results of both async calls
					const currentStockInfo = await callCurrentPrices(ticker);

					//console.log(historicStockInfo);
					console.log(currentStockInfo);

					if (currentStockInfo.error) {
						console.error(
							"Error occurred:",
							currentStockInfo.message
						);
						new Notice(
							"Error: couldn't retrieve stock information",
							15000
						);
					} else {
						// Name of the stock
						stock["name"] = currentStockInfo.name
							? currentStockInfo.name
							: null;

						// Currency of the stock
						stock["currency"] = currentStockInfo.currency
							? currentStockInfo.currency
							: null;

						// Bid price of the stock
						if (currentStockInfo.response.bid)
							stock["bid"] = currentStockInfo.response.bid.value
								? currentStockInfo.response.bid.value
								: null;

						// Ask price of the stock
						if (currentStockInfo.response.ask)
							stock["ask"] = currentStockInfo.response.ask.value
								? currentStockInfo.response.ask.value
								: null;

						// Market cap of the stock
						stock["marketCap"] = currentStockInfo.response.marketCap
							? currentStockInfo.response.marketCap
							: null;

						// Previous close price of the stock
						stock["previousClose"] = currentStockInfo.response
							.previousClose
							? currentStockInfo.response.previousClose
							: null;

						// Volume of shares for the stock
						stock["volume"] = currentStockInfo.response.volume
							? currentStockInfo.response.volume
							: null;

						// 52 week high
						stock["fiftytwo_high"] = currentStockInfo.response
							.fiftyTwoWeekRange.high
							? currentStockInfo.response.fiftyTwoWeekRange.high
							: null;

						// 52 week low
						stock["fiftytwo_low"] = currentStockInfo.response
							.fiftyTwoWeekRange.low
							? currentStockInfo.response.fiftyTwoWeekRange.low
							: null;

						// Day range high
						stock["dayRange_high"] = currentStockInfo.response
							.dayRange.high
							? currentStockInfo.response.dayRange.high
							: null;

						// Day range low
						stock["dayRange_low"] = currentStockInfo.response
							.dayRange.low
							? currentStockInfo.response.dayRange.low
							: null;

						// Date and time of provided information
						stock["updated"] = currentStockInfo.response.updated
							? currentStockInfo.response.updated
							: null;

						// BUILD OUTPUT
						var output = "> [!info]- " + ticker + " ";
						if (stock.bid && stock.ask)
							output +=
								"(Bid: " +
								stock.bid +
								", Ask: " +
								stock.ask +
								", Spread: " +
								(
									((stock.ask - stock.bid) / stock.ask) *
									100
								).toFixed(3) +
								"%)";

						if (stock.name) output += "\n> **Name:** " + stock.name;
						// if (stock.dayChange)
						// 	output +=
						// 		" (" +
						// 		stock.dayChange +
						// 		" / " +
						// 		stock.dayChangePercent +
						// 		"%)";
						if (stock.currency)
							output += "\n> **Currency:** " + stock.currency;
						if (stock.volume)
							output +=
								"\n> **Volume:** " +
								stock.volume.toLocaleString("en-US");
						if (stock.currency && stock.marketCap)
							output +=
								"\n> **Market cap:** " +
								formatLongNumber(stock.marketCap);
						if (stock.dayRange_low && stock.dayRange_high)
							output +=
								"\n> **Day range:** " +
								stock.dayRange_low +
								" – " +
								stock.dayRange_high;
						if (stock.fiftytwo_low && stock.fiftytwo_high)
							output +=
								"\n> **52W range:** " +
								stock.fiftytwo_low +
								" – " +
								stock.fiftytwo_high;
						if (stock.updated)
							output +=
								"\n>\n><small>*" +
								new Date(stock.updated) +
								"*</small>";

						editor.replaceSelection(`${output}` + "\n\n");

						for (var r in stock) delete stock[r];
						for (var r in currentStockInfo)
							delete currentStockInfo[r];
					}
				};

				new InsertLinkModal(this.app, selectedText, onSubmit).open();
			},
		});
	}
}

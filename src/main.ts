import { Editor, Plugin, Notice } from "obsidian";
import { InsertLinkModal } from "./modal";
import yahooStockAPI from "yahoo-stock-api";
import { getSymbolResponse } from "yahoo-stock-api/dist/types/getSymbol";

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

					const logError = (msg: string) => {
						console.error("Error occurred:", msg);
						new Notice(
							"Error: couldn't retrieve stock information",
							15000
						);
					};

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

					console.log(currentStockInfo);

					// create object to store stock return values
					const stock: { [key: string]: any } = {};

					if (currentStockInfo) {
						// check the API sent back something
						if (!currentStockInfo.error) {
							// if the API didn't send back an error
							stock["name"] = currentStockInfo.name ?? null; // Name of the stock
							stock["currency"] =
								currentStockInfo.currency ?? null; // Currency of the stock
							stock["bid"] =
								currentStockInfo.response.bid.value ?? null; // Bid price of the stock
							stock["ask"] =
								currentStockInfo.response.ask.value ?? null; // Ask price of the stock
							stock["marketCap"] =
								currentStockInfo.response.marketCap ?? null; // Market cap of the stock
							stock["previousClose"] =
								currentStockInfo.response.previousClose ?? null; // Previous close price of the stock
							stock["volume"] =
								currentStockInfo.response.volume ?? null; // Volume of shares for the stock
							stock["fiftytwo_high"] =
								currentStockInfo.response.fiftyTwoWeekRange
									.high ?? null; // 52 week high
							stock["fiftytwo_low"] =
								currentStockInfo.response.fiftyTwoWeekRange
									.low ?? null; // 52 week low
							stock["dayRange_high"] =
								currentStockInfo.response.dayRange.high ?? null; // Day range high
							stock["dayRange_low"] =
								currentStockInfo.response.dayRange.low ?? null; // Day range low
							stock["updated"] =
								currentStockInfo.response.updated ?? null; // Date and time of provided information

							// BUILD OUTPUT
							let output = "> [!info]- " + ticker + " ";
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
							else if (stock.previousClose)
								output +=
									"(Previous close: " +
									stock.previousClose +
									")";

							if (stock.name)
								output += "\n> **Name:** " + stock.name;
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
							if (stock.bid && stock.ask && stock.previousClose)
								output +=
									"\n> **Previous close:** " +
									stock.previousClose;
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

							for (const r in stock) delete stock[r];
							for (const r in currentStockInfo)
								delete currentStockInfo[r];
						} else {
							// API call returned an error
							logError(currentStockInfo.message as string);
						}
					} else {
						// API call returned null
						logError("API did not respond");
					}
				};

				new InsertLinkModal(this.app, selectedText, onSubmit).open();
			},
		});
	}
}

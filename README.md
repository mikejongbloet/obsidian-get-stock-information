# Get Stock Information
Return information about a particular stock symbol using the Yahoo Finance API.

## How to use

1. In Edit mode, run the command "Get Stock Information: Insert stock info".
2. Enter the stock symbol (e.g. AAPL)
3. Click "Get stock information"

After a brief pause (0.5 - 8 seconds depending on how lively the API is feeling), a new callout block will be added to your page with the following information:

* Bid price
* Ask price
* Spread %
* Name
* Currency
* Volume
* Market cap
* Day range (low - high)
* 52 week range (low - high)
* Time of information

For example"
```
> [!info]- AAPL (Bid: 164.9, Ask: 164.91, Spread: 0.006%)
> **Name:** Apple Inc.
> **Currency:** USD
> **Volume:** 68,749,792
> **Market cap:** 2.6T
> **Day range:** 162.13 – 165
> **52W range:** 124.17 – 178.49
>
><small>*Sun Apr 02 2023 18:28:05 GMT+0100 (British Summer Time)*</small>
```

## Credit

https://github.com/phamleduy04/yahoo-stock-api - the project I've used to pull in the information from Yahoo Finance

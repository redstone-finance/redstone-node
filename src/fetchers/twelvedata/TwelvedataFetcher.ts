import _ from "lodash";
import { BaseFetcher } from "../BaseFetcher";
import { PricesObj } from "../../types";
import axios from "axios";


export class TwelvedataFetcher extends BaseFetcher {

  constructor() {
    super("twelvedata");
  } 

  async fetchData(symbols: string[]): Promise<any> {
	let symbolsConcatenated: string = '';
	for (const s of symbols) {
	  symbolsConcatenated += s + '/USD,'
	}
	
	let r = axios.get('https://twelve-data1.p.rapidapi.com/currency_conversion',
	  {
		params: {symbol: symbolsConcatenated, amount: '1'},
		headers: {
			'X-RapidAPI-Host': 'twelve-data1.p.rapidapi.com',
			'X-RapidAPI-Key': '018f33edefmsh2b9184e5673858ep1ee0dcjsn2969316d3b08'
		  }
	  }
	);
	return await r;
  }

  async extractPrices(response: any): Promise<PricesObj> {
	interface Curr {
	    symbol: string,
		rate: number,
		amount: number,
		timestamp: number
	}
    const pricesObj: { [symbol: string]: number } = {};

	for (const key of Object.keys(response.data)) {
	  var currObj: Curr = response.data[key];
	  pricesObj[currObj.symbol.split("/")[0]] = currObj.rate;
	}

    return pricesObj;
  }
};
export namespace PayXTypes {
	export type Client = {
		hdm: {
			/**
			 * Using this API, you register your sale with the tax authority, including the sold products and other relevant details. (The generated receipt's PDF version is stored for 60 days, see section 3 for more information)
			 */
			print(request: PrintRequest, options?: Options): Promise<PrintResponse>;
			/**
			 * If the correct data is entered, this method will send the fiscal receipt via SMS to the specified phone number.
			 */
			sendSms(
				request: SendSmsRequest,
				options?: Options,
			): Promise<SendSmsResponse>;
			/**
			 * If the correct data is entered, this method will send the fiscal receipt via email.
			 */
			sendEmail(
				request: SendEmailRequest,
				options?: Options,
			): Promise<SendEmailResponse>;
			/**
			 * This API performs a fiscal receipt return.
			 */
			reverse(
				request: ReverseRequest,
				options?: Options,
			): Promise<ReverseResponse>;
			/**
			 * This API performs both transaction returns and returns of transactions made using prepayment, excluding prepayment receipts. A full return of the products is processed.
			 */
			reverseByReceiptId(
				request: ReverseByReceiptIdRequest,
				options?: Options,
			): Promise<ReverseByReceiptIdResponse>;
		};
	};

	export type Options = {
		baseUrl?: string;
		username?: string;
		password?: string;
		logging?: boolean;
	};

	export type PrintRequest = {
		/**
		 * List of sold products
		 */
		products: Product[];
		/**
		 * Total discount appêd to the products
		 */
		additionalDiscount: number;
		/**
		 * Amount paid in cash
		 */
		cashAmount: number;
		/**
		 * Amount paid be card
		 */
		cardAmount: number;
		/**
		 * Refund amount
		 */
		partialAmount: number;
		/**
		 * Prepayment amount
		 */
		prePaymentAmount: number;
		/*
		 * Buyer's TIN
		 */
		partnerTin: string;
		/**
		 * Unique request ID – each generated e-receipt must have a unique, non-repeating ID (up to 30 characters, containing only digits or a combination of Latin letters and digits)
		 */
		uniqueCode: string;
		// eMarks: Emark[];
	};

	export type Product = {
		/**
		 * Product LP FE code / PCTAC classification
		 */
		adgCode: string;
		/**
		 * Product bar code/ internal code
		 */
		goodCode: string;
		/**
		 * Full product name (no more than 50 characters including spaces and punctuation marks)
		 */
		goodName: string;
		/**
		 * Product quantity (no more than 3 characters after the comma)
		 */
		quantity: number;
		/**
		 * Unit of product measurement
		 */
		unit: string;
		/**
		 * Selling price of the product (no more than 2 characters after the comma)
		 */
		price: number;
		/**
		 * Amount of discount applicable to the product
		 */
		discount: number;

		/**
		 * Product discount type
		 * 1 - percentable discount
		 * 2 - AMD discount
		 */
		discountType: 1 | 2;
		/**
		 * Product number (counting starts from 0)
		 */
		receiptProductId: number;
		/**
		 * 1 - Taxable with VAT
		 * 2 - Exempt from VAT
		 * 3 - Turnover Tax
		 * 7 - microenterprize
		 */
		dep: 1 | 2 | 3 | 7;
	};

	export type PrintResponse = Receipt;

	export type Receipt = {
		link: string;
		reverceLink: string;
		res: {
			printResponse: {
				rseq: number;
				crn: string;
				sn: string;
				tin: string;
				taxpayer: string;
				address: string;
				time: number;
				total: number;
				change: number;
				qr: string;
				commercial_address: string;
				commercial_name: string;
			};
			printResponseInfo: {
				cashierId: number;
				cardAmount: number;
				cashAmount: number;
				partialAmount: number;
				prePayment: number;
				saleType: number;
				receiptType: number;
				receiptSubType: number;
				totalAmount: number;
				time: number;
				items: {
					receiptProductId: number;
					quantity: number;
					dep: number;
					vat: number;
					taxRegime: number;
					goodCode: string;
					goodName: string;
					adgCode: string;
					unit: string;
					price: number;
					totalWithoutTaxes: number;
					totalWithTaxes: number;
				}[];
			};
			recieptId: number;
			receiptId: number;
			message: string;
		};
	};

	export type ReverseRequest = {
		/**
		 * The receipt number, which is provided immediately after the sale or during the GetPrintedReceiptsByPage request.
		 */
		historyId: number;
		/**
		 * List of returned products
		 */
		products: ReturnProduct[];
		/**
		 * Amount paid in cash
		 */
		cashAmount: number;
		/**
		 * Amount paid by card
		 */
		cardAmount: number;
		/**
		 * Amount of prepayment used
		 */
		prePaymentAmount: number;
	};
	export type ReverseResponse = Receipt;

	export type ReturnProduct = {
		/**
		 * Product index (count starts from 0)
		 */
		receiptProductId: number;
		/**
		 * Product quantity
		 */
		quantity: number;
	};

	export type SendSmsRequest = {
		/**
		 * The sequential number of the completed sale history, provided by the getHistory request
		 */
		historyId: number;
		/**
		 * The receipt number, provided immediately after the sale or during the GetPrintedReceiptsByPage request
		 * If you send the receiptId, then historyId must be sent as 0
		 */
		receiptId: number;
		/**
		 * Sending the fiscal receipt via SMS to the phone number
		 */
		phone: string;
		/**
		 * Language of the e-receipt:
		 * 0 – Armenian
		 * 1 – English
		 * 2 – Russian
		 */
		language: 0 | 1 | 2;
	};

	export type SendSmsResponse = {
		message: string;
	};

	export type SendEmailRequest = {
		/**
		 * The sequential number of the completed sale history, provided by the getHistory request
		 */
		historyId: number;
		/**
		 * The receipt number, provided immediately after the sale or during the GetPrintedReceiptsByPage request
		 * If you send the receiptId, then historyId must be sent as 0
		 */
		receiptId: number;
		/**
		 * Sending the fiscal receipt via Email
		 */
		email: string;
		/**
		 * Language of the e-receipt:
		 * 0 – Armenian
		 * 1 – English
		 * 2 – Russian
		 */
		language: 0 | 1 | 2;
	};

	export type SendEmailResponse = {
		message: string;
	};

	export type ReverseByReceiptIdRequest = {
		/**
		 * The receipt number, which is provided immediately after the sale or during the GetPrintedReceiptsByPage request.
		 */
		receiptId: number;
	};

	export type ReverseByReceiptIdResponse = Receipt;
}

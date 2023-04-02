import { App, Modal, Setting } from "obsidian";

export class InsertLinkModal extends Modal {
	ticker: string;

	onSubmit: (ticker: string) => void;

	constructor(
		app: App,
		defaultTicker: string,
		onSubmit: (ticker: string) => void
	) {
		super(app);
		this.ticker = defaultTicker;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Insert stock information" });

		new Setting(contentEl).setName("Stock ticker").addText((text) =>
			text.setValue(this.ticker).onChange((value) => {
				this.ticker = value;
			})
		);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Get stock information")
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.ticker);
				})
		);
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}

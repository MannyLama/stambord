import {app, callerName, posFilter, itemControl} from './index.js';
import {sesamCollapse, sesam} from 'https://unpkg.com/sesam-collapse@4.0.0';

const status = new callerName('dataExport');
let currentUserId = null;

export const uiControl = {
	initialize() {
		status.init();

		this.addListeners();
		this.checkFilledInputFields();

		if (readCookie('screen-width-dismiss') == null) {
			this.checkWindowSize();
		}

		this.collapseMenuTargets = document.querySelectorAll('[data-sesam-target].collapse-menu');

		this.createCollapseIndex = 0;
		this.selectedUser = document.querySelector('[data-label="clickedUser"]');

	},

	addListeners() {
		status.add('addListeners');

		document.body.addEventListener('click', (event) => {
			this.sesamCloseClickedOutside(event.target.closest('[data-sesam-target].collapse-menu'));
			this.updateUserString();

			if (event.target.closest('[data-label="posCheckoutFilterItemType"]') != null) {
				app.playSound();
				this.posItemsShowType(event.target.closest('[data-label="posCheckoutFilterItemType"] button'))
			}
		});

		/*
		document.body.addEventListener('focusout', (event) => {
			const floatingLabel = event.target.closest('.input-group.floating-label');

			if (floatingLabel != null && floatingLabel.querySelector('input').value !== '') floatingLabel.classList.add('input-group-filled');
			else if (floatingLabel != null && floatingLabel.classList.remove('input-group-filled')) ; //todo
		});*/

		document.querySelector('#modalScreenWidth .modal-footer').addEventListener('click', (event) => {
			app.playSound();
			this.dismissScreenWidthModal(event.target.closest('button').dataset.label)

		})
	},

	checkWindowSize() {
		if ((window.innerWidth < 800)) {
			$('#modalScreenWidth').modal('show')
		}
	},

	dismissScreenWidthModal(input) {
		switch (input) {
			case 'dismissNow':
				createCookie('screen-width-dismiss', 'true', 1);
				break;

			case 'dismissAlways':
				createCookie('screen-width-dismiss', 'true');
				break;

			default:
				break;
		}
	},

	sesamCloseClickedOutside(clickedItem) {
		const itemToClose = document.querySelector('[data-sesam-target].collapse-menu.sesam-show');
		if (clickedItem == null && itemToClose != null) {
			status.add('sesamCloseClickedOutside');
			sesamCollapse.itemHide(itemToClose);
		}
	},

	checkFilledInputFields() {
		const fields = document.querySelectorAll('.input-group.floating-label');

		fields.forEach(el => {
			if (el.querySelector('input').value !== '') el.classList.add('input-group-filled');
			else el.classList.remove('input-group-filled');
		});
	},

	createCollapse({title, show, content, parent}) {
		title.content === undefined ? title.content = 'title content' : title.content = title.content;
		title.el === undefined ? title.el = 'h4' : title.el = title.el;
		show === undefined || show === false ? show = '' : show = 'show';
		content === undefined ? content = 'inner content' : content = content;
		parent === undefined ? parent = '' : parent = `data-parent="${parent}"`;

		const renderedHTML = `
            <div data-target="#generatedCollapse${this.createCollapseIndex}" data-toggle="collapse" aria-expanded="false" aria-controls="generatedCollapse${this.createCollapseIndex}" ${parent}>
                <${title.el}>${title.content}</${title.el}>
            </div>
            <div id="generatedCollapse${this.createCollapseIndex}" class="collapse">
                ${content}
            </div>
        `;

		this.createCollapseIndex++;
		return renderedHTML;
	},

	posItemsShowType(button) {
		status.add('posItemsShowType');

		posFilter.filter({
			pane: itemControl.posCheckout,
			keys: ['name', 'id', 'type'],
			entry: button.dataset.value.toLowerCase()
		});
	},

	async updateUserString() {
		await new Promise(resolve => setTimeout(resolve, 100));
		if (app.checkoutUser != null && currentUserId !== app.checkoutUser) {
			app.db.users.orderBy('name').each(i => {
				if (i.id === app.checkoutUser) {
					this.selectedUser.innerHTML = i.name;
					currentUserId = i.id;
				}
			});
		}
	}
};

// uiControl.initialize();

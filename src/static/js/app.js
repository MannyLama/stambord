import {sesamCollapse} from 'https://unpkg.com/sesam-collapse@4.0.0';
import {
	callerName,
	dataExport,
	datalog,
	posCheckout,
	userControl,
	itemControl,
	settings,
	uiControl
} from './modules/index.js';

sesamCollapse.initialize();

const status = new callerName('app');
const clicksound = new Audio('static/sounds/click_sound.mp3');
const noSound = new Audio('static/sounds/no.mp3');

export const app = {
	initialize() {
		status.init();

		this.cache();
		this.dexie();
		this.addListeners();
		this.toastIndex = 0;

		dataExport.initialize();

		settings.addListeners();
		this.readyState();

		uiControl.initialize();
	},

	readyState() {
		status.add('readyState');

		// uiControl.initialize();
		$('.modal').modal('hide');
		$('#carouselPosSteps').carousel(0);
		userControl.render();
		itemControl.render();
		datalog.render();
		this.hidePaneOptions();
		this.checkRecordAmount();
		settings.loadSupportContent();
	},

	cache() {
		this.alerts = {
			users: document.querySelector('[data-label="alert-noUsers"]'),
			items: document.querySelector('[data-label="alert-noItems"]')
		}
	},

	addListeners() {
		status.add('addListeners');

		userControl.posCheckout.addEventListener('change', (event) => {
			this.playSound();
			this.checkoutUser = event.target.value;
			$('#carouselPosSteps').carousel('next');
		});

		itemControl.posCheckout.addEventListener('change', (event) => {
			this.playSound();
			this.checkoutItem = event.target.value;
			posCheckout.amountSelector.classList.add('d-none');
			posCheckout.checkout();
		});

		userControl.posUsers.addEventListener('click', (event) => {
			this.playSound();
			this.controlPaneOptions(event);
		});

		itemControl.posItems.addEventListener('click', (event) => {
			this.playSound();
			this.controlPaneOptions(event);
		});

		posCheckout.amountSelector.addEventListener('change', (event) => {
			posCheckout.calculatePrice(event.target.value);
		});
	},

	controlPaneOptions(event) {
		event.preventDefault();

		const parent = event.target.closest('div[role]');
		const label = event.target.closest('label').getAttribute('for');
		const checkBox = document.querySelector(`#${label}`);

		if (checkBox.checked === true) {
			checkBox.checked = false;
			// nav-users
			parent.classList.remove('show-control-btns')
		} else {
			checkBox.checked = true;
			parent.classList.add('show-control-btns')
		}
	},

	checkRecordAmount() {
		status.add('checkRecordAmount');

		app.db.users.count()
			.then(response => {
				if (response === 0) {
					this.alerts.users.classList.remove('d-none');
				} else if (response > 0) {
					this.alerts.users.classList.add('d-none');
				}
			})
			.catch(error => {
				status.log(error)
			});
		app.db.items.count()
			.then(response => {
				if (response === 0) {
					this.alerts.items.classList.remove('d-none');
				} else if (response > 0) {
					this.alerts.items.classList.add('d-none');
				}
			})
			.catch(error => {
				status.log(error)
			});
	},

	hidePaneOptions() {
		document.querySelectorAll('.show-control-btns').forEach(i => {
			i.classList.remove('show-control-btns');
		})
	},

	emptyDomLists() {
		status.add('emptyDomLists');

		itemControl.posItems.innerHTML = '';
		userControl.posUsers.innerHTML = '';
	},

	dexie() {
		status.add('dexie');

		this.db = new Dexie('users');
		this.db.version(1).stores({
			users: "id,name,credit,weight",
			items: "id,name,profit,type,price",
			logs: "date,user,item,amount,price"
		});
		this.db.open();
	},

	deleteDexieData() {
		status.add('deleteDexieData');

		status.add('dexieDeleteUsers: ' + this.dexieDeleteUsers());
		this.dexieDeleteItems();
		this.dexieDeleteLogs();

		this.readyState();
	},

	async dexieDeleteUsers() {
		status.add('dexieDeleteUsers');

		this.db.users
			.where('id').startsWith('user')
			.delete()
			.then(function (deleteCount) {
				//console.log( "Deleted " + deleteCount + " user-objects");
			});
	},

	async dexieDeleteItems() {
		status.add('dexieDeleteItems');

		this.db.items
			.where('id').startsWith('item')
			.delete()
			.then(function (deleteCount) {
				//console.log( "Deleted " + deleteCount + " item-objects");
			});
	},

	async dexieDeleteLogs() {
		status.add('dexieDeleteLogs');

		this.db.logs
			//.where('amount').above(0)
			//.delete()
			.clear()
			.then(function (deleteCount) {
				//console.log( "Deleted " + deleteCount + " log-objects");
			});
	},

	logging() {
		status.add('logging');
	},

	clearFields(target) {
		status.add('clearFields');

		if (target === undefined) {
			const fields = document.querySelectorAll('[data-clear-field]');

			fields.forEach(i => {
				i.value = '';
			})
		} else {
			target.querySelectorAll('input[type="text"], input[type="number"], input[type="password"]').forEach(i => {
				i.value = '';
			})
		}
	},

	clearFieldsOnSubmit(target) {
		target.querySelectorAll('input[type="text"], input[type="number"]').forEach(i => {
			i.value = '';
		})
	},

	createToast(title, message) {
		status.add('createToast');

		let now, moment;
		function addZero(i) {
			if (i < 10) {
				i = "0" + i;
			}
			return i;
		}

		now = new Date();
		moment = {
			dd: addZero(now.getDate()),
			mm: addZero(now.getMonth() + 1),
			yyyy: now.getFullYear(),
			hh: addZero(now.getHours()),
			nn: addZero(now.getMinutes()),
		};

		let toast = document.createElement('div');
		this.toastIndex++;

		toast.classList.add('toast', 'animated', 'fadeInUp', 'faster');
		toast.setAttribute('data-toast', `toastIndex${this.toastIndex}`);
		toast.setAttribute('data-delay', `3500`);
		toast.setAttribute('role', `alert`);
		toast.setAttribute('aria-atomic', `true`);
		toast.setAttribute('aria-live', `assertive`);

		toast.innerHTML = `
            <div class="toast-body">
                <p class="toast-title mr-auto text-modern bold mb-0">${title}</p>
                <p class="toast-content mb-0">${message}</p>
                <small class="text-muted d-none">${moment.hh}:${moment.nn}</small>
            </div>
            <button type="button" class="close" data-dismiss="toast" aria-label="Close">
                <div class="icon-md"><i data-feather="x"></i></div>
            </button>
        `;

		toast.addEventListener('animationend', function () {
			toast.classList.add('animated', 'fadeOutDown', 'delay-3s')
		});

		document.querySelector('#toastContainer').appendChild(toast);
		feather.replace();

		$(`[data-toast="toastIndex${this.toastIndex}"]`).toast('show');

		let secondTime = false;
		toast.onanimationend = function () {
			if (secondTime){
				document.querySelector('#toastContainer').removeChild(toast)
			} else { secondTime = true;}
		};
	},

	errorText(element, content) {
		element = document.querySelectorAll(`[data-error="${element}"]`);
		element.forEach((el) => {
			// el.style.display = 'block !important';
			el.innerHTML = content;
		})
	},

	async playSound() {
		console.log("clickSound!");
		await clicksound.play();
	}
};

app.initialize();

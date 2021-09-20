/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

export class Trello {
  constructor(element, contentType = 'text') {
    if (typeof element === 'string') {
      this.element = document.querySelector(element);
    }
    this.contentType = contentType;
    this.activeDragCard = undefined;

    this.form = this.element.querySelector('.trello__form');
    this.btnAddCard = this.element.querySelector('.btn-add-card');
    this.btnOpenForm = this.element.querySelector('.btn-open-form');
    this.btnCloseForm = this.element.querySelector('.btn-close-form');
    this.formInput = this.element.querySelector('.trello__form-input-img');
    this.formDesc = this.element.querySelector('.trello__form-desc');
    this.todoRow = this.element.querySelector('.todo-row');
    this.rows = this.element.querySelectorAll('.trello__card-row');
    this.inputOverlay = this.element.querySelector(
      '.trello__form-input-overlay'
    );

    this.createCard = this.createCard.bind(this);
    this.stopSendForm = this.stopSendForm.bind(this);
    this.openFormForAddCard = this.openFormForAddCard.bind(this);
    this.closeFormForAddCard = this.closeFormForAddCard.bind(this);
    this.onUpload = this.onUpload.bind(this);
    this.handlerLoad = this.handlerLoad.bind(this);
    this.removeInvalid = this.removeInvalid.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragDrop = this.onDragDrop.bind(this);
    this.removeCardItem = this.removeCardItem.bind(this);
    this.onStartDrag = this.onStartDrag.bind(this);
    this.onEndDrag = this.onEndDrag.bind(this);
    this.onDrag = this.onDrag.bind(this);

    this.form.addEventListener('submit', this.stopSendForm);
    this.btnAddCard.addEventListener('click', this.createCard);
    this.btnOpenForm.addEventListener('click', this.openFormForAddCard);
    this.btnCloseForm.addEventListener('click', this.closeFormForAddCard);
    this.formInput.addEventListener('change', this.onUpload);
    this.formDesc.addEventListener('focus', this.removeInvalid);
    this.inputOverlay.addEventListener('dragover', this.onDragOver);
    this.inputOverlay.addEventListener('drop', this.onDragDrop);
    this.rows.forEach((row) =>
      row.addEventListener('mousedown', this.onStartDrag)
    );
  }

  removeInvalid() {
    this.formDesc.classList.remove('invalid');
  }

  stopSendForm(e) {
    e.preventDefault();
  }

  onDragOver(e) {
    e.preventDefault();
  }

  onDragDrop(e) {
    e.preventDefault();

    this.onUpload({ target: e.dataTransfer });
  }

  createCard() {
    let card;

    if (!this.formDesc.value && this.imageSrc) {
      card = `<div class="trello__card-item">
                <span class="trello__item-remove"></span>
                <div class="trello__card-img">
                  <img src="${this.imageSrc}" alt="card-image" />
                </div>
            </div>`;
    }

    if (!this.imageSrc && this.formDesc.value) {
      card = `<div class="trello__card-item">
                <span class="trello__item-remove"></span>
                <p class="trello__card-text">${this.formDesc.value}</p>
            </div>`;
    }

    if (this.imageSrc && this.formDesc.value) {
      card = `<div class="trello__card-item">
                <span class="trello__item-remove"></span>
                <div class="trello__card-img">
                  <img src="${this.imageSrc}" alt="card-image" />
                </div>
                <p class="trello__card-text">${this.formDesc.value}</p>
            </div>`;
    }

    if (!card) {
      this.formDesc.classList.add('invalid');
      return;
    }

    this.closeFormForAddCard();

    this.todoRow.insertAdjacentHTML('beforeend', card);

    this.btnRemoveItem = this.element.querySelectorAll('.trello__item-remove');
    this.btnRemoveItem.forEach((el) =>
      el.addEventListener('click', this.removeCardItem)
    );
  }

  openFormForAddCard() {
    this.form.classList.add('show');
    this.btnOpenForm.classList.add('hidden');
  }

  closeFormForAddCard() {
    this.form.classList.remove('show');
    this.btnOpenForm.classList.remove('hidden');
    this.formDesc.value = '';
    this.formInput.value = '';
    this.imageSrc = '';
  }

  onUpload(e) {
    const { target } = e;
    const file = target.files && target.files[0];

    if (this.contentType !== 'file') {
      const reader = new FileReader();

      reader.addEventListener('load', (event) => {
        this.handlerLoad(event.target.result, file);
      });

      if (this.contentType === 'text') reader.readAsText(file);
      if (this.contentType === 'image') reader.readAsDataURL(file);
    } else {
      const url = URL.createObjectURL(file);

      this.handlerLoad(url, file);
    }
  }

  handlerLoad(result) {
    this.imageSrc = result;
  }

  removeCardItem(e) {
    const { target } = e;
    const removingCard = target.closest('.trello__card-item');

    removingCard.remove();
    removingCard
      .querySelector('.trello__item-remove')
      .removeEventListener('click', this.removeCardItem);
  }

  onStartDrag(e) {
    const { target } = e;

    if (target.classList.contains('trello__item-remove')) return;

    this.activeDragElement = target.closest('.trello__card-item');

    if (this.activeDragElement) this.activeDragElement.classList.add('dragged');

    document.documentElement.addEventListener('mouseup', this.onEndDrag);
    document.documentElement.addEventListener('mousemove', this.onDrag);

    this.onDrag(e);
  }

  onEndDrag(e) {
    if (this.activeDragElement) {
      const closest = document.elementFromPoint(e.clientX, e.clientY);
      const closestItem = closest.closest('.trello__card-item');
      const closestRow = closest.closest('.trello__card-row');

      this.activeDragElement.classList.remove('dragged');

      if (closestRow) {
        closestRow.appendChild(this.activeDragElement);
      }

      if (closestItem) {
        closestItem.insertAdjacentElement('afterend', this.activeDragElement);
      }

      this.activeDragElement.style = '';
      this.activeDragElement = undefined;
    }

    document.documentElement.removeEventListener('mouseup', this.onEndDrag);
    document.documentElement.removeEventListener('mousemove', this.onDrag);
  }

  onDrag(e) {
    e.preventDefault();

    if (!this.activeDragElement) {
      return;
    }

    const closest = document.elementFromPoint(e.clientX, e.clientY);

    if (closest.classList.contains('trello__card-item')) {
      closest.addEventListener('mouseover', () => {
        if (!this.activeDragElement) {
          return;
        }
        closest.style.marginBottom = `${this.activeDragElement.offsetHeight}px`;
      });

      closest.addEventListener('mouseout', () => {
        closest.style.marginBottom = '';
      });

      closest.addEventListener('mouseup', () => {
        closest.style.marginBottom = '';
      });
    }

    // const shiftX =
    //   e.clientX - this.activeDragElement.getBoundingClientRect().left;
    // const shiftY =
    //   e.clientY - this.activeDragElement.getBoundingClientRect().top;

    this.activeDragElement.style.left = `${e.clientX + window.scrollX}px`;
    this.activeDragElement.style.top = `${e.clientY + window.scrollY}px`;
  }
}

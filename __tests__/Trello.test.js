/**
 * @jest-environment jsdom
 */

import { Trello } from '../src/js/components/Trello';

describe('Trello', () => {
  let trelloElement = null;
  let type = null;

  document.body.innerHTML = `
      <div class="trello">
      <div class="trello__content">
        <div class="trello__todo">
          <h2 class="trello__title">Todo</h2>
          <div class="trello__card-row todo-row"></div>
        </div>

        <div class="trello__in-progress">
          <h2 class="trello__title">In Progress</h2>
          <div class="trello__card-row"></div>
        </div>

        <div class="trello__done">
          <h2 class="trello__title">Done</h2>
          <div class="trello__card-row"></div>
        </div>

        <div class="trello__create-card">
          <button class="btn btn-open-form" type="button">
            Add another card
          </button>

          <form class="trello__form">
            <textarea
              class="trello__form-desc"
              placeholder="Describe the task"
            ></textarea>
            <label class="trello__form-input-overlay" for="form-input-file"
              >Choose image or drag it here</label
            >
            <input
              class="trello__form-input-img"
              type="file"
              id="form-input-file"
            />

            <div class="trello__from-btns">
              <button class="btn btn-add-card" type="submit">Add Card</button>
              <button class="btn-close-form" type="button">X</button>
            </div>
          </form>
        </div>
      </div>
    </div>`;

  beforeEach(() => {
    trelloElement = '.trello';
    type = 'image';
  });

  it('test create card', () => {
    const trello = new Trello(trelloElement, type);
    trello.formDesc.value = 'asdasd';
    const todo = document.querySelector('.todo-row');

    trello.createCard();

    expect(todo.children.length).toBe(1);
  });
});

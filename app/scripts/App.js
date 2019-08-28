window.OB = window.OB || {};

window.OB.App = (() => {
  const STATES = {
    home: {
      on: {
        start: 'config',
      },
    },
    config: {
      on: {
        start: 'simulator',
      },
    },
    simulator: {
      on: {
        restart: 'config',
      },
    },
  };

  let state = 'home';
  let numPlayers = 4;

  let playerSetup = {
    2: {
      blocked: 2,
      chits: {
        trendy: 5,
        metro: 6,
        ruins: 6,
      },
    },
    3: {
      blocked: 1,
      chits: {
        trendy: 8,
        metro: 7,
        ruins: 7,
      },
    },
    4: {
      blocked: 0,
      chits: {
        trendy: 9,
        metro: 9,
        ruins: 9,
      },
    },
  };

  const translate = (state, action) => STATES[state].on[action];

  /**
   * Handles player count click action
   * @param {object} evt Click event
   */
  const onClickPlayerCount = (evt) => {
    evt.preventDefault();

    const app = document.getElementById('app');
    const { players } = evt.currentTarget.dataset;
    numPlayers = players;

    state = translate(state, 'start');
    app.dataset.state = state;
    configState();
  };

  /**
   * Configures current state behavior
   */
  const configState = () => {
    const view = document.getElementById(`view-${state}`);

    const actions = {
      home: () => {},
      config: () => {
        view.querySelectorAll('[data-players]').forEach((element) => {
          element.removeEventListener('click', onClickPlayerCount);
          element.addEventListener('click', onClickPlayerCount);
        });
      },
    };

    if (actions[state]) {
      actions[state]();
    }
  };

  /**
   * Configures the current view
   */
  const configActions = () => {
    const app = document.getElementById('app');

    app.querySelectorAll('[data-action]').forEach((element) => {
      const { action } = element.dataset;

      element.addEventListener('click', () => {
        state = translate(state, action);
        app.dataset.state = state;
        configState();
      });
    });
  };

  /**
   * Initializes the application
   */
  const init = () => {
    configActions();
    configState();
  };

  return {
    init,
  };
})();

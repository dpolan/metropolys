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

  const ZONES = ['north', 'east', 'south', 'west'];

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

  let deferredInstallPrompt = null;

  /**
   * Gets the new application state, applyng the given action to the current one
   * @return {string} State name
   */
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
   * Gets a random zone from the array
   * @return {string} Zone slug
   */
  const getRandomZone = () => ZONES[Math.floor(Math.random() * ZONES.length)];

  /**
   * Gets a random zone adjacent at the given one
   * @return {string} Zone slug
   */
  const getAdjacentZone = (zone) => {
    // Find the zone index
    const index = ZONES.indexOf(zone);

    // Randomly get one after / before it
    let adjacent = Math.random() > 0.5 ? index - 1 : index + 1;

    if (adjacent < 0) {
      adjacent = ZONES.length - 1;
    } else if (adjacent >= ZONES.length) {
      adjacent = 0;
    }

    return ZONES[adjacent];
  };

  /**
   * Clears the simulator DOM state
   */
  const clearSimulator = () => {
    document.querySelectorAll('[data-zone]').forEach((element) => {
      element.classList.remove('is-active');
    });

    document.querySelectorAll('[data-chit]').forEach((element) => {
      delete element.dataset.chit;
    });
  };

  /**
   * Draws a number of random chits from the given pool
   * @param  {object} chits Current chit group
   * @param  {number} qty   Number of chits to be drawn
   * @return {object}       List of chits drawn and the remaining pool
   */
  const drawChits = (chits, qty) => {
    const result = [];

    for (let i = 0; i < qty; i += 1) {
      const index = Math.floor(Math.random() * chits.length);
      result.push(chits.splice(index, 1));
    }

    return result;
  };

  /**
   * Generates a plain array of chits to be drawn
   * @param  {object} chits Type and quantity of chits to be generated
   * @return {array}        List of chits to be drawn
   */
  const generateChits = (chits) => {
    const result = [];

    for (let i = 0, l = chits.trendy; i < l; i += 1) {
      result.push('trendy');
    }

    for (let i = 0, l = chits.metro; i < l; i += 1) {
      result.push('metro');
    }

    for (let i = 0, l = chits.ruins; i < l; i += 1) {
      result.push('ruins');
    }

    return result;
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
      simulator: () => {
        clearSimulator();

        // Inactive zones
        const { blocked, chits } = playerSetup[numPlayers];
        const currentChits = generateChits(chits);

        const zone = getRandomZone();
        const adjacent = getAdjacentZone(zone);

        if (blocked > 0) {
          document.querySelector(`[data-zone=${zone}]`).classList.add('is-active');

          if (blocked === 2) {
            document.querySelector(`[data-zone=${adjacent}]`).classList.add('is-active');
          }
        }

        // Chit location

        // Perimeter
        for (let i = 0, l = ZONES.length; i < l; i += 1) {
          if (
            document.querySelector(`[data-zone=${ZONES[i]}]`).classList.contains('is-active') ===
            false
          ) {
            const points = document.querySelectorAll(`[data-point="${ZONES[i]}"]`);
            const result = drawChits(currentChits, 5);

            // Render the result into random points
            for (let j = 0, m = result.length; j < m; j += 1) {
              let point = points[Math.floor(Math.random() * points.length)];

              while (typeof point.dataset.chit !== typeof undefined) {
                point = points[Math.floor(Math.random() * points.length)];
              }

              point.dataset.chit = result[j];
            }
          }
        }

        // Center
        const points = document.querySelectorAll('[data-point="center"]');
        const result = drawChits(currentChits, 7);

        // Render the result into random points
        for (let j = 0, m = result.length; j < m; j += 1) {
          let point = points[Math.floor(Math.random() * points.length)];

          while (typeof point.dataset.chit !== typeof undefined) {
            point = points[Math.floor(Math.random() * points.length)];
          }

          point.dataset.chit = result[j];
        }

        // Check PWA installation
        if (deferredInstallPrompt !== null) {
          deferredInstallPrompt.prompt();
        }
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
   * Handles PWA install prompt activation event
   * @param {object} evt 'beforeinstallprompt' event
   */
  const saveBeforeInstallPromptEvent = (evt) => {
    deferredInstallPrompt = evt;
  };

  /**
   * Initializes the application
   */
  const init = () => {
    configActions();
    configState();

    window.addEventListener('beforeinstallprompt', saveBeforeInstallPromptEvent);
  };

  return {
    init,
  };
})();

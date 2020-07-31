let currentGenData;

// Fetch all the generation with thier URLs to make succeeding API calls to
// get a list of pokemon from any generation.
const fetchAllGenData = async () => {
  const response = await axios.get(`https://pokeapi.co/api/v2/generation/`);
  return response.data;
};

// Fetch pokemon generation data
const fetchGenData = async (generation = "1") => {
  const response = await axios.get(
    `https://pokeapi.co/api/v2/generation/${generation}`
  );
  return response.data;
};

// Initalize the pokemon search input
const pokemonSearch = document.querySelector("#pokemonSearchRoot");
pokemonSearch.innerHTML = `
  <label><b>Search for a Pokemon</b></label>
  <input id="genSearch" class="input" />
  <div id="pokemonDropdown" class="dropdown">
    <div class="dropdown-menu">
      <div id="pokemonDropdownContent" class="dropdown-content results"></div>
    </div>
  </div>
`;

// Initialize the generation selection dropdown text.
const genSelect = document.querySelector("#genSelectRoot");
genSelect.innerHTML = `
  <div id="genDropdown" class="dropdown">
    <div class="dropdown-trigger">
      <button class="button" aria-haspopup="true" aria-controls="dropdown-menu"/>
        <span id="dropdownGenText" >Generations</span>
        <span class="icon is-small">
          <i class="fas fa-angle-down"></i>
        </span>
      </button>
    </div>
    <div class="dropdown-menu" id="dropdown-menu" role="menu">
      <div id="dropdownContent" class="dropdown-content">

      </div>
    </div>
  </div>
`;

// Move containers.
const moveMainContainer = document.createElement("div");
const movePanelContainer = document.createElement("div");
const moveInfoContainer = document.createElement("div");
moveMainContainer.classList.add("columns");
movePanelContainer.classList.add("column");
moveInfoContainer.classList.add("column");

movePanelContainer.innerHTML = `
  <article id="move-panel" class="panel is-info">
    <p class="panel-heading">
      Move List
    </p>
    <p class="panel-tabs">
      <a class="is-active">All</a>
    </p>
    <div class="panel-block">
      <p class="control has-icons-left">
        <input class="input is-info" type="text" placeholder="Search">
        <span class="icon is-left">
          <i class="fas fa-search" aria-hidden="true"></i>
        </span>
      </p>
    </div>
  </article>
`;

// Creates the modal and fills it with the appropiate HTML.
const modal = document.createElement("div");
modal.classList.add("modal");
modal.innerHTML = `
  <div class="modal-background"></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Modal title</p>
      <button class="delete" aria-label="close"></button>
    </header>
    <section class="modal-card-body">
      <!-- Content ... -->
    </section>
    <footer class="modal-card-foot">
      <button class="button">Cancel</button>
    </footer>
  </div>
`;

// Initialize the body container, which contain all the indiviual pokemons info.
const bodyContainer = document.querySelector("#bodyContainer");
bodyContainer.innerHTML = `
  <div id="pokemonNameContainer">
    <h1 id="pokemonName">Select a pokemon from any generation!!</h1>
  </div>
`;

// Adds modal to body container so it can be activated when needed and
// adds an event listener to the modal background to disable the modal
// on click.
bodyContainer.appendChild(modal);
const modalCard = document.querySelector(".modal-card");
const modalBackground = document.querySelector(".modal-background");
const modalTitle = document.querySelector(".modal-card-title");
const modalContent = document.querySelector(".modal-card-body");
const modalContentContainer = document.createElement("div");
modalContent.appendChild(modalContentContainer);
modalBackground.addEventListener("click", () => {
  modal.classList.remove("is-active");
});

// Grabs some DOM elements to manipulate.
const pokemonNameContainer = document.querySelector("#pokemonNameContainer");
const pokemonName = document.querySelector("#pokemonName");
const dropdown = document.querySelector("#genDropdown");
const pokemonDropdown = document.querySelector("#pokemonDropdown");
const infoContainer = document.createElement("div");

// Activates the generation dropdown on click.
dropdown.addEventListener("click", () => {
  dropdown.classList.add("is-active");
});

// Initializes all the generation and put them into the dropdown.
const setInitGenData = async () => {
  const genData = await fetchAllGenData();
  const dropdownContent = document.querySelector("#dropdownContent");
  const dropdownText = document.querySelector("#dropdownGenText");
  processInitGenData(genData, dropdownContent, dropdownText);
};

// Adds the generation options to the dropdown.
const processInitGenData = (genData, dropdownContent, dropdownText) => {
  let genIndex = 1;
  for (let gen of genData.results) {
    const genText = processGenText(gen);
    const option = document.createElement("a");
    option.classList.add("dropdown-item");
    option.innerText = `${genText}`;
    option.setAttribute("data-value", genIndex);
    option.addEventListener("click", () => {
      dropdownText.innerText = `${genText}`;
      let genID = option.getAttribute("data-value").toString();
      onGenSelect(genID);
      dropdown.classList.remove("is-active");
    });
    genIndex++;
    dropdownContent.appendChild(option);
  }
};

// Capitalizes the first letter of the currents pokemons name.
const processGenText = (gen) => {
  let [text, num] = gen.name.split("-");
  num = num.toUpperCase();
  text = text[0].toUpperCase() + text.slice(1);
  return [text, num].join("-");
};

// Fetch data corresponding to the generation selected in the dropdown.
const onGenSelect = async (gen) => {
  const response = await fetchGenData(gen);
  currentGenData = processGenData(response);
  console.log(currentGenData);
};

// Gets the pokemon from the current generation data.
const processGenData = (currentGenData) => {
  if (!currentGenData) return;
  console.log(currentGenData);
  const pokemon = currentGenData.pokemon_species;
  return pokemon;
};

// Clears the pokemon search dropdown
const clearPokemonDropdown = () => {
  while (pokeDropdownContent.firstChild) {
    pokeDropdownContent.removeChild(pokeDropdownContent.lastChild);
  }
};

// Sets initial generation data.
setInitGenData();

const pokeDropdownContent = document.querySelector("#pokemonDropdownContent");

// Searches through the current generation data to find
// the pokemon the user is typing in.
const searchData = (searchTerm) => {
  if (!currentGenData) return;

  if (!searchTerm) {
    pokemonDropdown.classList.remove("is-active");
    clearPokemonDropdown();
    return;
  }

  clearPokemonDropdown();
  let topTwentyPokemon = getToptwentyResults(currentGenData, searchTerm);
  pokemonDropdown.classList.add("is-active");

  for (let pokemon of topTwentyPokemon) {
    processPokeDropdown(pokemon, pokeDropdownContent);
  }
};

// Gets the top twenty pokemon.
const getToptwentyResults = (genData, searchTerm) => {
  let filteredPokemon = genData.filter((pokemon) => {
    return pokemon.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
  });
  let topTwentyPokemon = filteredPokemon.slice(0, 20);
  return topTwentyPokemon;
};

// Adds pokemon to the pokemon search dropdown.
const processPokeDropdown = (pokemon, element) => {
  const pokemonName = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);
  const option = document.createElement("a");
  option.classList.add("dropdown-item");
  option.innerText = `${pokemonName}`;
  option.addEventListener("click", () => {
    input.value = pokemonName;
    onPokemonSelect(pokemon);
  });
  element.appendChild(option);
};

// Fetch data for the individual pokemon and show the
// details on the screen.
const onPokemonSelect = async (pokemon) => {
  clearContainer(pokemonNameContainer);
  clearContainer(infoContainer);
  pokemonNameContainer.innerHTML = `
    <b class="name-text">Loading...<b>
    <progress class="progress is-large is-info" max="100">60%</progress>
  `;
  const data = await getPokemonData(pokemon);
  pokemonNameContainer.innerHTML = ``;
  initNameText(data);
  initInfoText(data);
};

// Fetches more specific data on the selected pokemon.
const getPokemonData = async (pokemon) => {
  const processedURL = pokemon.url.split("/");
  processedURL.pop();
  const genID = processedURL.pop().toString();
  const response = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${genID}`
  );
  console.log(response.data);
  return response.data;
};

// Fills in the info container with the selected pokemon's info.
const initInfoText = (data) => {
  if (!data) return;
  const { height, weight, moves, game_indices } = data;
  infoContainer.classList.add("info-container");
  infoContainer.appendChild(getVersionsEl(game_indices));
  infoContainer.appendChild(getPhysicalEl(height, weight));
  infoContainer.appendChild(moveMainContainer);
  bodyContainer.appendChild(infoContainer);
  filterMoves(moves);
};

// Return an element containing all the versions the Pokemon
// appears in.
const getVersionsEl = (gameIndices) => {
  const pokeVersions = getPokeVersions(gameIndices);
  const versionsCol = document.createElement("div");
  const versionsDiv = document.createElement("div");
  versionsCol.classList.add("columns");
  versionsDiv.classList.add("column");
  versionsCol.appendChild(versionsDiv);
  versionsDiv.innerHTML = `
    <b class="info-text" > Versions: </b>
    <b>${pokeVersions.join(",")}</b>
  `;
  return versionsCol;
};

// Returns an element containing the height and weight of
// a pokemon.
const getPhysicalEl = (height, weight) => {
  const heightWeightStats = document.createElement("div");
  heightWeightStats.classList.add("physical-container");
  heightWeightStats.innerHTML = `
    <b class="info-text" >Height: ${height} inches,</b>
    <b class="info-text" >Weight: ${weight} lbs</b> 
  `;
  return heightWeightStats;
};

// Get every version the Pokemon appeared in.
const getPokeVersions = (gameIndices) => {
  const versions = [];
  gameIndices.map((gameIndex) => {
    versions.push(gameIndex.version.name);
  });
  return versions;
};

// Filters the Pokemon's moves and adds them to the move panel.
const filterMoves = (moves) => {
  moveMainContainer.appendChild(movePanelContainer);
  moveMainContainer.appendChild(moveInfoContainer);
  const filteredMoves = moves.slice(0, 5);
  const movePanel = document.querySelector("#move-panel");
  for (let moveIndex of filteredMoves) {
    const { name } = moveIndex.move;
    const option = document.createElement("a");
    option.classList.add("panel-block");
    option.innerHTML = `
      <b>${name}</b>
    `;
    option.addEventListener("click", () => {
      onMoveSelect(moveIndex);
    });
    movePanel.appendChild(option);
  }
};

const onMoveSelect = async (moveIndex) => {
  clearContainer(modalContent);
  const { url } = moveIndex.move;
  const moreMoveData = await getMoveData(url);
  const { id } = moreMoveData;
  const { name } = moveIndex.move;
  console.log(moreMoveData);
  modal.classList.add("is-active");
  modalTitle.innerText = `${name.toUpperCase()} - ID: ${id}`;
  modalContent.appendChild(getMoveStatsEl(moreMoveData));
  modalContent.appendChild(createDivider());
  modalContent.appendChild(getMoveContestDataEl(moreMoveData));
};

const getMoveStatsEl = (moreMoveData) => {
  const { power, accuracy, type, pp } = moreMoveData;
  const moveStatsContainer = document.createElement("div");
  moveStatsContainer.innerHTML = `
    <label><b>MOVE STATS<b/></label>
    <div class="columns" >
      <div class="column" >
        <b>Power: ${power}</b>
      </div>
      <div class="column" >
        <b>Accuracy: ${accuracy}</b>
      </div>
      <div class="column" >
        <b>Type: ${type.name.toUpperCase()}</b>
      </div>
      <div class="column" >
        <b>PP: ${pp}</b>
      </div>
    </div>
  `;
  return moveStatsContainer;
};

const getMoveContestDataEl = (moreMoveData) => {
  const { contest_type, damage_class } = moreMoveData;
  const contestContainer = document.createElement("div");
  contestContainer.innerHTML = `
    <label><b>CONTEST STATS<b/></label>
    <div class="columns" >
      <div class="column" >
        <b>Contest Type: ${contest_type.name.toUpperCase()}</b>
      </div>
      <div class="column" >
        <b>Damage Class: ${damage_class.name.toUpperCase()}</b>
      </div>
    </div>
  `;
  return contestContainer;
};

const getMoveData = async (moveURL) => {
  const response = await axios.get(moveURL);
  return response.data;
};

// Fills the header name text and pokemon image.
const initNameText = (data) => {
  const { name, types } = data;
  const { sprites } = data;
  const typeText = document.createElement("h1");
  typeText.innerHTML = `<b>- Type(s): (</b>`;
  typeText.classList.add("name-text");
  pokemonNameContainer.appendChild(getNameEl(name));
  pokemonNameContainer.appendChild(typeText);
  processPokeType(types, pokemonNameContainer);
  processPokeImg(sprites);
};

// Returns element containing the Pokemon's name.
const getNameEl = (name) => {
  const capitalizedName = name[0].toUpperCase() + name.slice(1);
  const nameEl = document.createElement("b");
  nameEl.classList.add("name-text");
  nameEl.innerText = `${capitalizedName}`;
  pokemonName.classList.add("name-text");
  return nameEl;
};

// Gets the types of the pokemon.
const processPokeType = (types, element) => {
  let counter = types.length;
  types.map((pokemonType) => {
    const headerText = document.createElement("h1");
    headerText.classList.add("name-text");
    if (counter > 1) {
      headerText.innerHTML = `<b>${pokemonType.type.name},</b>`;
    } else {
      headerText.innerHTML = `<b>${pokemonType.type.name})</b>`;
    }
    element.appendChild(headerText);
    counter--;
  });
};

// Adds the default image and turns the image shiny on click.
const processPokeImg = (sprites) => {
  const imgContainer = document.createElement("div");
  imgContainer.innerHTML = `
    <img id="pokemon-image" alt="PokemonImage" src="${sprites.front_default}" />
  `;
  pokemonNameContainer.appendChild(imgContainer);
  const pokeImg = document.querySelector("#pokemon-image");
  pokeImg.addEventListener("click", () => {
    imgContainer.innerHTML = `
    <img id="pokemon-image" alt="PokemonImage" src="${sprites.front_shiny}" />
  `;
  });
};

// Creates a divider.
const createDivider = () => {
  const divider = document.createElement("hr");
  divider.classList.add("divider");
  return divider;
};

// Clears any container with elements passed to it.
const clearContainer = (container) => {
  while (container.firstChild) {
    container.removeChild(container.lastChild);
  }
};

// The pokemon search dropdown input. Listens for
// whenever a user types in the input field
const input = document.querySelector("#genSearch");
input.addEventListener("input", (event) => {
  searchData(event.target.value);
});

// Closes the dropdown menus when clicking away.
document.addEventListener("click", (event) => {
  if (!genSelect.contains(event.target)) {
    dropdown.classList.remove("is-active");
    pokemonDropdown.classList.remove("is-active");
    clearPokemonDropdown();
  }
});

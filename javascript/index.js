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

const moveMainContainer = document.createElement("div");
const movePanelContainer = document.createElement("div");
const moveInfoContainer = document.createElement("div");
moveMainContainer.classList.add("columns");
movePanelContainer.classList.add("column");
moveInfoContainer.classList.add("column");
moveMainContainer.appendChild(movePanelContainer);
moveMainContainer.appendChild(moveInfoContainer);

movePanelContainer.innerHTML = `
  <article class="panel is-info">
    <p class="panel-heading">
      Info
    </p>
    <p class="panel-tabs">
      <a class="is-active">All</a>
      <a>Public</a>
      <a>Private</a>
      <a>Sources</a>
      <a>Forks</a>
    </p>
    <div class="panel-block">
      <p class="control has-icons-left">
        <input class="input is-info" type="text" placeholder="Search">
        <span class="icon is-left">
          <i class="fas fa-search" aria-hidden="true"></i>
        </span>
      </p>
    </div>
    <a class="panel-block is-active">
      <span class="panel-icon">
        <i class="fas fa-book" aria-hidden="true"></i>
      </span>
      bulma
    </a>
    <a class="panel-block">
      <span class="panel-icon">
        <i class="fas fa-book" aria-hidden="true"></i>
      </span>
      marksheet
    </a>
  </article>
`;

// Initialize the body container, which contain all the indiviual pokemons info.
const bodyContainer = document.querySelector("#bodyContainer");
bodyContainer.innerHTML = `
  <div id="pokemonNameContainer">
    <h1 id="pokemonName">Select a pokemon from any generation!!</h1>
  </div>
`;

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
  const { height, weight, moves } = data;
  const allMoves = moves;
  const heightWeightStats = document.createElement("div");
  heightWeightStats.classList.add("physical-container");
  heightWeightStats.innerHTML = `
    <b class="info-text" >Height: ${height} inches,</b>
    <b class="info-text" >Weight: ${weight} lbs</b> 
  `;
  infoContainer.classList.add("info-container");
  infoContainer.appendChild(heightWeightStats);
  infoContainer.appendChild(moveMainContainer);
  bodyContainer.appendChild(infoContainer);
};

const filterMoves = (moves) => {
  const redBlue = {};
  for (let element of moves) {
    for (let version of element.version_group_details) {
      switch (version.version_group.name) {
        case "red-blue":
        // redBlue[]
      }
    }
  }
};

// Fills the header name text and pokemon image.
const initNameText = (data) => {
  const { name, types } = data;
  const { sprites } = data;
  const capitalizedName = name[0].toUpperCase() + name.slice(1);
  const typeText = document.createElement("h1");
  const nameEl = document.createElement("b");
  nameEl.classList.add("name-text");
  nameEl.innerText = `${capitalizedName}`;
  pokemonName.classList.add("name-text");
  typeText.innerHTML = `<b>- Type(s): (</b>`;
  typeText.classList.add("name-text");
  pokemonNameContainer.appendChild(nameEl);
  pokemonNameContainer.appendChild(typeText);
  processPokeType(types, pokemonNameContainer);
  processPokeImg(sprites);
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
const createDivider = (element) => {
  const divider = document.createElement("hr");
  divider.classList.add("divider");
  element.appendChild(divider);
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

let currentGenData;
let searchTerm = "";

const fetchAllGenData = async () => {
  const response = await axios.get(`https://pokeapi.co/api/v2/generation/`);
  return response.data;
};

const fetchGenData = async (generation = 1) => {
  const response = await axios.get(
    `https://pokeapi.co/api/v2/generation/${generation}`
  );
  return response.data;
};

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

const genSelect = document.querySelector("#genSelectRoot");
genSelect.innerHTML = `
  <div id="genDropdown" class="dropdown">
    <div class="dropdown-trigger">
      <button class="button" aria-haspopup="true" aria-controls="dropdown-menu"/>
        <span id="dropdownGenText" >Generations</span>
        <span class="icon is-small">
          <i class="fas fa-angle-down" aria-hidden="true"></i>
        </span>
      </button>
    </div>
    <div class="dropdown-menu" id="dropdown-menu" role="menu">
      <div id="dropdownContent" class="dropdown-content">

      </div>
    </div>
  </div>
`;

const bodyContainer = document.querySelector("#bodyContainer");
bodyContainer.innerHTML = `
  <h1 id="pokemonName">Current Pokemon</h1>
`;
const pokemonName = document.querySelector("#pokemonName");
const dropdown = document.querySelector("#genDropdown");
const pokemonDropdown = document.querySelector("#pokemonDropdown");

dropdown.addEventListener("click", () => {
  dropdown.classList.add("is-active");
});

const setInitGenData = async () => {
  const genData = await fetchAllGenData();
  const dropdownContent = document.querySelector("#dropdownContent");
  const dropdownText = document.querySelector("#dropdownGenText");
  let genIndex = 1;
  console.log(genData);

  for (let gen of genData.results) {
    let [text, num] = gen.name.split("-");
    num = num.toUpperCase();
    text = text[0].toUpperCase() + text.slice(1);
    const genText = [text, num].join("-");
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

const processGenData = (currentGenData) => {
  if (!currentGenData) return;
  console.log(currentGenData);
  const pokemon = currentGenData.pokemon_species;
  return pokemon;
};

const onGenSelect = async (gen) => {
  const response = await fetchGenData(gen);
  currentGenData = processGenData(response);

  console.log(currentGenData);
};

const clearPokemonDropdown = () => {
  while (pokeDropdownContent.firstChild) {
    pokeDropdownContent.removeChild(pokeDropdownContent.lastChild);
  }
};

setInitGenData();

const pokeDropdownContent = document.querySelector("#pokemonDropdownContent");

const searchData = (searchTerm) => {
  if (!currentGenData) return;

  if (!searchTerm) {
    pokemonDropdown.classList.remove("is-active");
    clearPokemonDropdown();
    return;
  }

  clearPokemonDropdown();
  let filteredPokemon = currentGenData.filter((pokemon) => {
    return pokemon.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
  });
  let topTwentyPokemon = filteredPokemon.slice(0, 20);

  pokemonDropdown.classList.add("is-active");

  console.log(filteredPokemon);

  for (let pokemon of topTwentyPokemon) {
    const option = document.createElement("a");
    option.classList.add("dropdown-item");
    option.innerText = `${pokemon.name}`;
    option.addEventListener("click", () => {
      input.value = pokemon.name;
      onPokemonSelect(pokemon);
    });
    pokeDropdownContent.appendChild(option);
  }
};

const onPokemonSelect = async (pokemon) => {
  const processedURL = pokemon.url.split("/");
  processedURL.pop();
  const genID = processedURL.pop().toString();

  const response = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${genID}`
  );
  console.log(response.data);
  pokemonName.innerText = `${response.data.name}`;
};

const input = document.querySelector("#genSearch");
input.addEventListener("input", (event) => {
  searchData(event.target.value);
});

document.addEventListener("click", (event) => {
  if (!genSelect.contains(event.target)) {
    dropdown.classList.remove("is-active");
    pokemonDropdown.classList.remove("is-active");
    clearPokemonDropdown();
  }
});

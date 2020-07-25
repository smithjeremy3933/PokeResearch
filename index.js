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

const setInitGenData = async () => {
  const genData = await fetchAllGenData();
  const dropdown = document.querySelector("#dropdown");
  const genDisplay = document.querySelector("#currentGen");
  let genIndex = 1;
  console.log(genData);

  for (let gen of genData.results) {
    let [text, num] = gen.name.split("-");
    num = num.toUpperCase();
    text = text[0].toUpperCase() + text.slice(1);
    const genText = [text, num].join("-");
    const option = document.createElement("div");
    option.classList.add("item");
    option.innerText = `${genText}`;
    option.setAttribute("data-value", genIndex);
    option.addEventListener("click", () => {
      genDisplay.innerHTML = `${genText}`;
      let genID = option.getAttribute("data-value").toString();
      onGenSelect(genID);
    });
    genIndex++;
    dropdown.appendChild(option);
  }
};

const onGenSelect = async (gen) => {
  const response = await fetchGenData(gen);
  console.log(response);
};

setInitGenData();

const nav = document.querySelector("#navRoot");
nav.innerHTML = `
    <div class="ui secondary menu">
        <a class="item">
        Home
        </a>
        <a class="item">
        Messages
        </a>
        <a class="item">
        Friends
        </a>
        <div class="right menu">
            <div id="generations" class="item">
                <div class="ui simple dropdown">
                    <input type="hidden" name="gender">
                    <i class="dropdown icon"></i>
                    <div class="default text">Generation</div>
                    <div id="dropdown" class="menu">
                  
                    </div>
                </div>
            </div>
            <div class="item">
                <div id="currentGen"></div>
            </div>
            <div class="item">
                <div class="ui icon input">
                    <input id="pokeInput" type="text" placeholder="Search..." />
                    <i class="search link icon"></i>
                </div>
            </div>
        </div>
    </div>
`;

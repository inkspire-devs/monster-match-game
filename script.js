import { monsters } from './monsters.js';

const rounds = [
  {
    category: "orientation",
    title: "Looking for...",
    options: [
      { text: "Male-Presenting Entities", value: "Male" },
      { text: "Female-Presenting Entities", value: "Female" },
      { text: "Fluid / Non-Binary Entities", value: "Fluid" }
    ]
  },    
  {
    category: "setting",
    title: "Where do you feel most at home?",
    options: [
      { text: "A rocky, shadowy mountain pass", value: "Mountain Pass" },   
      { text: "A sparkling underwater kingdom", value: "Underwater Kingdom" },
      { text: "An icy, frozen desert", value: "Frozen Tundra" },
      { text: "A dark, whispering forest", value: "Dark Forest" },
      { text: "A high-tech space station", value: "Space Station" },
      { text: "A crumbling, endless labyrinth", value: "Ancient Labyrinth" },
      { text: "A snow-dusted, windy mountain peak", value: "Mountain Peak" },
      { text: "A drafty, haunted manor", value: "Haunted Manor" },
      { text: "A scorching inferno", value: "7th Ring of Hell" },
    ]
  },
  {
    category: "taxonomy",
    title: "What is your preferred taxonomic group?",
    options: [
      { text: "Group 1: Homo Monstra", value: "Group 1", desc: "Superficially human, biologically divergent." },
      { text: "Group 2: Anthropica Aberrans", value: "Group 2", desc: "Humanoid with observable monstrous deviation." },
      { text: "Group 3: Monstra-Anthropo Hybrida", value: "Group 3", desc: "Hybrid organisms with human and non-human parts." },
      { text: "Group 4: Xenoforma Monstra", value: "Group 4", desc: "Fully non-human entities. No humanoid features." },
      { text: "Group 5: Intuitus Incorporea", value: "Group 5", desc: "Incorporeal or metaphysical intelligences." }
    ]
  },
  {
    category: "passion",
    title: "Define your wants on the Passion Meter",
    options: [
      { text: "Wholesome & Sweet", value: "Wholesome & Sweet" },
      { text: "Blush Inducing", value: "Blush Inducing" },
      { text: "Relentless Seduction", value: "Relentless Seduction" },
      { text: "Unhinged", value: "Unhinged" }
    ]
  }
];

let selectedTags = [];
let matchedMonsters = [];
let currentCardIndex = 0;
let currentPage = 0;

// --- NAVIGATION & UI LOGIC ---
function renderPage() {
    const container = document.getElementById('tag-clouds');
    const title = document.querySelector('#setup-screen h2');
    container.innerHTML = ""; 

    const round = rounds[currentPage];
    title.innerText = round.title;

    if (round.category === "taxonomy") {
        const subtitle = document.createElement('p');
        subtitle.className = "page-subtitle";
        subtitle.innerText = "Find more in-depth data on the released Field Compendium files (by signing up to the newsletter)";
        container.appendChild(subtitle);
    }

    if (round.category === "passion") {
        renderPassionMeter(round, container);
    } else {
        renderStandardTags(round, container);
    }

    const navContainer = document.createElement('div');
    navContainer.className = "nav-btns";

    const resetBtn = document.createElement('button');
    resetBtn.innerText = "Reset";
    resetBtn.className = "btn-no"; 
    resetBtn.onclick = resetGame;

    const actionBtn = document.createElement('button');
    actionBtn.id = "find-monsters-btn";
    actionBtn.innerText = currentPage < rounds.length - 1 ? "Next Step" : "Initialize Match";
    actionBtn.onclick = nextPage;

    navContainer.appendChild(resetBtn);
    navContainer.appendChild(actionBtn);
    container.appendChild(navContainer);
}

function renderStandardTags(round, container) {
    round.options.forEach(opt => {
        const wrapper = document.createElement('div');
        wrapper.className = "tag-wrapper";
        const isSelected = selectedTags.includes(opt.value);
        const btn = document.createElement('button');
        btn.className = `tag-btn ${isSelected ? 'selected' : ''}`;
        btn.innerText = opt.text;
        btn.onclick = () => toggleTag(opt.value, btn);
        wrapper.appendChild(btn);
        if (opt.desc) {
            const d = document.createElement('p');
            d.className = "tag-desc";
            d.innerText = opt.desc;
            wrapper.appendChild(d);
        }
        container.appendChild(wrapper);
    });
}

function renderPassionMeter(round, container) {
    const meterBox = document.createElement('div');
    meterBox.className = "passion-meter-box";
    round.options.forEach((opt, index) => {
        const isSelected = selectedTags.includes(opt.value);
        const level = document.createElement('div');
        level.className = `meter-level ${isSelected ? 'selected' : ''}`;
        const intensity = ((index + 1) / round.options.length) * 100;
        level.innerHTML = `
            <span class="meter-label">${opt.text}</span>
            <div class="meter-bar" style="width: ${intensity}%"></div>
        `;
        level.onclick = () => toggleTag(opt.value, level);
        meterBox.appendChild(level);
    });
    container.appendChild(meterBox);
}

function toggleTag(value, element) {
    if (selectedTags.includes(value)) {
        selectedTags = selectedTags.filter(t => t !== value);
        element.classList.remove('selected');
    } else {
        selectedTags.push(value);
        element.classList.add('selected');
    }
}

function nextPage() {
    if (currentPage < rounds.length - 1) {
        currentPage++;
        renderPage();
    } else {
        startSwiping();
    }
}

function resetGame() {
    currentPage = 0;
    selectedTags = [];
    matchedMonsters = [];
    currentCardIndex = 0;
    document.getElementById('swipe-screen').style.display = 'none';
    document.getElementById('email-wall').style.display = 'none';
    document.getElementById('final-result').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'block';
    renderPage();
}

// --- GAME ENGINE ---
function startSwiping() {
    if (selectedTags.length === 0) {
        alert("Please select at least one parameter to begin.");
        return;
    }

    // 1. Identify which tags were selected for each specific category
    const chosenOrientations = selectedTags.filter(tag => 
        rounds[0].options.some(opt => opt.value === tag)
    );
    const chosenSettings = selectedTags.filter(tag => 
        rounds[1].options.some(opt => opt.value === tag)
    );
    const chosenTaxonomy = selectedTags.filter(tag => 
        rounds[2].options.some(opt => opt.value === tag)
    );
    const chosenPassions = selectedTags.filter(tag => 
        rounds[3].options.some(opt => opt.value === tag)
    );

    // 2. The Multi-Step Filter
    matchedMonsters = monsters.filter(m => {
        // A. Orientation: If user picked specific ones, monster MUST match. Otherwise, allow all.
        const matchesOrientation = chosenOrientations.length === 0 || chosenOrientations.includes(m.orientation);
        
        // B. Setting: If user picked specific settings, monster MUST match. Otherwise, allow all.
        const matchesSetting = chosenSettings.length === 0 || chosenSettings.includes(m.setting);
        
        // C. Taxonomy: If user picked specific groups, monster MUST match. Otherwise, allow all.
        const matchesTaxonomy = chosenTaxonomy.length === 0 || chosenTaxonomy.includes(m.taxonomy);

        // D. Passion: If user picked specific passion levels, monster MUST match. Otherwise, allow all.
        const matchesPassion = chosenPassions.length === 0 || chosenPassions.includes(m.passion);

        // All active filters must be true for this monster to stay in the deck
        return matchesOrientation && matchesSetting && matchesTaxonomy && matchesPassion;
    });

    // 3. Final Scoring (for sorting relevance if they picked many tags)
    matchedMonsters = matchedMonsters.map(m => {
        let score = 0;
        if (selectedTags.includes(m.setting)) score += 1;
        if (selectedTags.includes(m.taxonomy)) score += 2; 
        if (selectedTags.includes(m.passion)) score += 1;
        return { ...m, score };
    }).sort((a, b) => b.score - a.score);

    // 4. Handle Empty Results
    if (matchedMonsters.length === 0) {
        alert("DATABASE EMPTY: No entity matches that specific combination of parameters. Broaden your search.");
        return; // Don't reset, just let them change their tags
    }

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('swipe-screen').style.display = 'block';
    renderCard();
}

function renderCard() {
    const m = matchedMonsters[currentCardIndex];
    
    // 1. Match Counter
    const counter = document.getElementById('match-counter');
    counter.innerText = `RELEVANT ENTITIES: ${currentCardIndex + 1} / ${matchedMonsters.length}`;

    // 2. Image Handling
    const imageElement = document.getElementById('card-image');
    imageElement.src = (!m.imageURL || m.imageURL.includes("path/to")) 
        ? "https://via.placeholder.com/400x500.png?text=ENCOUNTER_ART_LOADING" 
        : m.imageURL;

    // 3. Header Section (Grid: Name on Left, Metadata on Right)
    const taxonomyRound = rounds.find(r => r.category === "taxonomy");
    const taxonomyOption = taxonomyRound.options.find(opt => opt.value === m.taxonomy);
    const fullTaxonomyLabel = taxonomyOption ? taxonomyOption.text : m.taxonomy;

    document.getElementById('card-content').innerHTML = `
        <div class="card-header-grid">
            <div class="header-left">
                <h1>${m.name}</h1>
                <p class="species-tag">${m.species}</p>
            </div>
            <div class="header-right">
                <p class="card-group">[ DATA_SOURCE: ${fullTaxonomyLabel} | ${m.orientation} ]</p>
                <p class="card-group">[ LOCATION: ${m.setting} ]</p>
            </div>
        </div>
    `;

    // 4. Profile Sections (Dossier Layout)
    const profileContainer = document.getElementById('card-profile');
    profileContainer.innerHTML = `
        <div class="profile-section bio-box">
            <h3 class="section-title">BIO</h3>
            <p class="section-body bio-text">${m.profile["Bio"]}</p>
        </div>

        <div class="fact-intercept">
            <h3 class="section-title">RANDOM FACT</h3>
            <p class="section-body italic-text">"${m.profile["Random Fact"]}"</p>
        </div>

        <div class="split-grid">
            <div class="profile-section">
                <h3 class="section-title">LOOKING FOR</h3>
                <ul class="bullet-list">${m.profile["Looking For"].split('. ').map(s => s ? `<li>${s}</li>` : '').join('')}</ul>
            </div>
            <div class="profile-section">
                <h3 class="section-title">WHAT TO EXPECT</h3>
                <ul class="bullet-list">${m.profile["What to Expect"].split('. ').map(s => s ? `<li>${s}</li>` : '').join('')}</ul>
            </div>
        </div>

        <div class="warning-block">
            <h3 class="section-title" style="color: red;">⚠️ WARNING</h3>
            <p class="section-body">${m.profile["Warning"]}</p>
        </div>
    `;
}

function nextCard() {
    currentCardIndex = (currentCardIndex + 1) % matchedMonsters.length;
    renderCard();
}

function triggerEmailWall() {
    document.getElementById('swipe-screen').style.display = 'none';
    document.getElementById('email-wall').style.display = 'block';
}

function showFinalResult(isSkip = false) {
    const emailInput = document.getElementById('user-email');
    const email = emailInput.value;
    const consent = document.getElementById('marketing-check').checked;
    const winner = matchedMonsters[currentCardIndex];

    // If it's NOT a skip, we validate the email
    if (!isSkip) {
        if (!email.includes("@") || !consent) {
            alert("ACCESS DENIED: Valid email and consent required for dossier decryption.");
            return;
        }

        // Send to Wix
        const payload = {
            email: email,
            monster: winner.name,
            source: "MonsterMatchGame"
        };
        window.parent.postMessage(payload, "*");
    }

    // UI Transition remains the same
    document.getElementById('email-wall').style.display = 'none';
    document.getElementById('dossier-monster-name').innerText = winner.name;
    document.getElementById('dossier-species').innerText = `SPECIES: ${winner.species}`;
    document.getElementById('dossier-paragraph').innerText = winner.encounterText;
    document.getElementById('dossier-screen').style.display = 'block';
}

function prevCard() {
    // This moves backward in the array, looping to the end if at the start
    currentCardIndex = (currentCardIndex - 1 + matchedMonsters.length) % matchedMonsters.length;
    renderCard();
}

// Kick off
renderPage();

window.nextPage = nextPage;
window.prevCard = prevCard;
window.resetGame = resetGame;
window.nextCard = nextCard;
window.triggerEmailWall = triggerEmailWall;
window.showFinalResult = showFinalResult;
window.toggleTag = toggleTag;

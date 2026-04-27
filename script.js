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

function sendHeightToWix() {
    const height = document.documentElement.scrollHeight + 40;
    window.parent.postMessage({ frameHeight: height }, "*");
}

// --- NEW: POPUP LOGIC ---
function openNewsletterPopup() {
    // Sends signal to Wix to open the Lightbox named "Newsletter"
    window.parent.postMessage("OPEN_NEWSLETTER", "*");
}

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
    
    setTimeout(sendHeightToWix, 100);
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
    // Force Wix to scroll to top every time we change questions
    window.parent.postMessage("SCROLL_TOP", "*");

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
    document.getElementById('dossier-screen').style.display = 'none';
    document.getElementById('setup-screen').style.display = 'block';
    
    renderPage();
    setTimeout(sendHeightToWix, 100);
}

// --- GAME ENGINE ---
function startSwiping() {
    if (selectedTags.length === 0) {
        alert("Please select at least one parameter to begin.");
        return;
    }

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

    matchedMonsters = monsters.filter(m => {
        const matchesOrientation = chosenOrientations.length === 0 || chosenOrientations.includes(m.orientation);
        const matchesSetting = chosenSettings.length === 0 || chosenSettings.includes(m.setting);
        const matchesTaxonomy = chosenTaxonomy.length === 0 || chosenTaxonomy.includes(m.taxonomy);
        const matchesPassion = chosenPassions.length === 0 || chosenPassions.includes(m.passion);
        return matchesOrientation && matchesSetting && matchesTaxonomy && matchesPassion;
    });

    matchedMonsters = matchedMonsters.map(m => {
        let score = 0;
        if (selectedTags.includes(m.setting)) score += 1;
        if (selectedTags.includes(m.taxonomy)) score += 2; 
        if (selectedTags.includes(m.passion)) score += 1;
        return { ...m, score };
    }).sort((a, b) => b.score - a.score);

    if (matchedMonsters.length === 0) {
        alert("No entity matches that specific combination. Broaden your search.");
        return; 
    }

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('swipe-screen').style.display = 'block';
    
    // Jump to top of card view
    window.parent.postMessage("SCROLL_TOP", "*");
    renderCard();
}

function renderCard() {
    const m = matchedMonsters[currentCardIndex];
    if(!m) return;

    const counter = document.getElementById('match-counter');
    counter.innerText = `RELEVANT ENTITIES: ${currentCardIndex + 1} / ${matchedMonsters.length}`;

    const imageElement = document.getElementById('card-image');
    imageElement.src = (!m.imageURL || m.imageURL.includes("path/to")) 
        ? "https://via.placeholder.com/400x500.png?text=ENCOUNTER_ART_LOADING" 
        : m.imageURL;

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
    setTimeout(sendHeightToWix, 150);
}

function nextCard() {
    window.parent.postMessage("SCROLL_TOP", "*");
    currentCardIndex = (currentCardIndex + 1) % matchedMonsters.length;
    renderCard();
}

function prevCard() {
    window.parent.postMessage("SCROLL_TOP", "*");
    currentCardIndex = (currentCardIndex - 1 + matchedMonsters.length) % matchedMonsters.length;
    renderCard();
}

function triggerEmailWall() {
    window.parent.postMessage("SCROLL_TOP", "*");
    document.getElementById('swipe-screen').style.display = 'none';
    document.getElementById('email-wall').style.display = 'block';
    setTimeout(sendHeightToWix, 100);
}

function showFinalResult(isSkip = false) {
    const winner = matchedMonsters[currentCardIndex];

    if (!winner) {
        console.error("Dossier Error: No monster object found in memory.");
        return;
    }

    // Since we aren't collecting email/consent here anymore, 
    // we simply trigger the scroll and display the result.
    window.parent.postMessage("SCROLL_TOP", "*");

    const nameEl = document.getElementById('dossier-monster-name');
    const speciesEl = document.getElementById('dossier-species');
    const paraEl = document.getElementById('dossier-paragraph');

    if (nameEl && speciesEl && paraEl) {
        nameEl.innerText = winner.name;
        speciesEl.innerText = `SPECIES: ${winner.species}`;
        paraEl.innerText = winner.encounterText || "Dossier data corrupted. Re-initialize scan.";
    }

    // UI Transition
    document.getElementById('email-wall').style.display = 'none';
    document.getElementById('dossier-screen').style.display = 'block';
    
    // Ensure the new screen starts at the top
    setTimeout(sendHeightToWix, 150);
}

// Kick off
renderPage();

// Export to Global Scope for HTML onclicks
window.nextPage = nextPage;
window.prevCard = prevCard;
window.resetGame = resetGame;
window.nextCard = nextCard;
window.triggerEmailWall = triggerEmailWall;
window.showFinalResult = showFinalResult;
window.toggleTag = toggleTag;
window.openNewsletterPopup = openNewsletterPopup;

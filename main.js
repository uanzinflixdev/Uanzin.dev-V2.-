const apiKey = '19406090525176a9220de0211fc1e7ed';
    const baseImgUrl = 'https://image.tmdb.org/t/p/w500';
    const baseImgUrlModal = 'https://image.tmdb.org/t/p/w1280';
    const baseImgUrlCard = 'https://image.tmdb.org/t/p/original';
 
    let highlightMovies = [];
    let currentHighlightIndex = 0;

    let loadedContentIds = new Set();

    async function fetchContentByGenre(genreId, containerSelector, isSeries = false) {
        let page = 1;
        let uniqueItemsFound = 0;
        const desiredUniqueItems = 40;
        const maxPages = 10; // Limite máximo de páginas para consulta
        const minVoteCount = 50; // Número mínimo de votos para relevância
    
        while (uniqueItemsFound < desiredUniqueItems && page <= maxPages) {
            const url = `https://api.themoviedb.org/3/discover/${isSeries ? 'tv' : 'movie'}?` +
                new URLSearchParams({
                    api_key: apiKey,
                    with_genres: genreId,
                    language: 'pt-BR',
                    page: page,
                    sort_by: 'popularity.desc', // Ordenar por popularidade
                    'vote_count.gte': minVoteCount, // Filtro de relevância
                });
    
            try {
                const response = await fetch(url);
                const data = await response.json();
    
                if (data.results.length === 0) break; // Se não há mais resultados, parar o loop
    
                data.results.forEach(item => {
                    if (uniqueItemsFound < desiredUniqueItems && !loadedContentIds.has(item.id)) {
                        loadedContentIds.add(item.id);
                        uniqueItemsFound++;
                        displayContent(item, containerSelector, isSeries);
                    }
                });
    
            } catch (error) {
                 break; // Parar se houver erro na API
            }
    
            page++; // Próxima página
        }
}

function displayContent(item, containerSelector, isSeries) {
    const container = document.querySelector(`${containerSelector} .carousel`);
    const card = createContentCard(item, isSeries);
    
    // Fallback para imagens inválidas
    card.querySelector('img').onerror = function() {
        this.src = 'img/fallback.jpg';
        this.style.objectFit = 'contain';
    };
    
    container.appendChild(card);
}

function createContentCard(content, isSeries) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'movie-card-container';
    
    // Elemento de imagem
    const imgElement = document.createElement('img');
    imgElement.className = 'movie-card';
    imgElement.loading = 'lazy';
    imgElement.src = `${baseImgUrl}${content.poster_path}`;
    imgElement.alt = content.title || content.name;

    // Elemento de título
    const titleElement = document.createElement('div');
    titleElement.className = 'movie-title';
    titleElement.textContent = content.title || content.name;
    
    // Hierarquia dos elementos
    cardContainer.appendChild(imgElement);
    cardContainer.appendChild(titleElement);

    // Mantendo funcionalidade original
    cardContainer.addEventListener('click', () => openModal(content, isSeries));
    
    return cardContainer;
}

    async function fetchHighlight() {
        const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&language=pt-BR`;   const response = await fetch(url);
        const data = await response.json();
        highlightMovies = data.results.slice(0, 7);
        updateHighlight();
        setInterval(nextHighlight, 5000);
    }

    function updateHighlight() {
    if (highlightMovies.length > 0) {
        const movie = highlightMovies[currentHighlightIndex];
        const container = document.getElementById('highlight');
        container.innerHTML = ''; // Limpa o conteúdo anterior

        const highlightCard = document.createElement('div');
        highlightCard.className = 'highlight-card';
        highlightCard.style.backgroundImage = `url(${baseImgUrlCard}${movie.backdrop_path})`;
        highlightCard.style.backgroundSize = 'cover';
        highlightCard.style.backgroundRepeat = 'no-repeat';
        highlightCard.style.backgroundPosition = 'center center';
        highlightCard.style.width = '100%';
        highlightCard.style.height = '56.25vw';
        highlightCard.style.cursor = 'pointer';

        const titleElement = document.createElement('div');
        titleElement.className = 'highlight-title';
        titleElement.textContent = movie.title || movie.name;
        highlightCard.appendChild(titleElement);

        highlightCard.addEventListener('click', function() {
            openModal(movie, !movie.title);
        });

        container.appendChild(highlightCard);
        addNavigationArrows(container);
        updateIndicators(container, highlightMovies.length, currentHighlightIndex);
    }
}

      function updateIndicators(container, total, activeIndex) {
    let indicatorContainer = document.querySelector('.indicator-container');
    if (!indicatorContainer) {
        indicatorContainer = document.createElement('div');
        indicatorContainer.className = 'indicator-container';
        container.appendChild(indicatorContainer);
    } else {
        indicatorContainer.innerHTML = '';
    }

    for (let i = 0; i < total; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'indicator' + (i === activeIndex ? ' active' : '');
        indicatorContainer.appendChild(indicator);
    }
}

    function addNavigationArrows(container) {
        const leftArrow = document.createElement('button');
        leftArrow.innerHTML = '&#9664;';
        leftArrow.className = 'arrow left';
        leftArrow.style.opacity = '0.5';
        leftArrow.onclick = prevHighlight;
        container.appendChild(leftArrow);

        const rightArrow = document.createElement('button');
        rightArrow.innerHTML = '&#9654;';
        rightArrow.className = 'arrow right';
        rightArrow.style.opacity = '0.5';
        rightArrow.onclick = nextHighlight;
        container.appendChild(rightArrow);
    }

    function nextHighlight() {
    currentHighlightIndex = (currentHighlightIndex + 1) % highlightMovies.length;
    updateHighlight();
}

    function prevHighlight() {
    currentHighlightIndex = (currentHighlightIndex - 1 + highlightMovies.length) % highlightMovies.length;
    updateHighlight();
}

    function openModal(content, isSeries) {
        const modal = document.getElementById('modal');
        modal.querySelector('.modal-header').innerHTML = `<h2>${content.title || content.name}</h2>`;
        modal.querySelector('.modal-body').innerHTML = `<p>${content.overview}</p>`;
        modal.style.display = "flex";
        
        const closeButton = modal.querySelector('.close-button');
        closeButton.onclick = () => { modal.style.display = "none"; };
    }

     
// Evento para mudar a seleção de filtro e buscar automaticamente
document.querySelectorAll('.filter-button').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelector('.filter-button.active').classList.remove('active'); // Remove o estado ativo
        this.classList.add('active'); // Adiciona o estado ativo ao botão clicado
        
        // Realiza a pesquisa automaticamente
        const query = document.getElementById('search-input-search').value;
        searchMoviesAndSeries(query);
    });
});

    async function searchMoviesAndSeries(query) {
    const filterType = document.querySelector('.filter-button.active').dataset.type; // Obtém o tipo de filtro selecionado
    let searchUrl;

    // Define o mínimo de votos e a URL de busca, ordenando por popularidade
    const minVoteCount = 1;
    const minPopularity = 2; // Define a popularidade mínima

    if (filterType === 'all') {
        searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR&vote_count.gte=${minVoteCount}&sort_by=popularity.desc`;
    } else {
        searchUrl = `https://api.themoviedb.org/3/search/${filterType}?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=pt-BR&vote_count.gte=${minVoteCount}&sort_by=popularity.desc`;
    }

    try {
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (response.ok) {
            // Filtra os resultados com base nos critérios
            const filteredResults = data.results.filter(item => {
                const hasBanner = item.poster_path; // Verifica se há uma imagem do banner
                const hasVotes = item.vote_count >= minVoteCount; // Verifica se há votos
                const meetsPopularity = item.popularity >= minPopularity; // Verifica a popularidade mínima
                const isAfter1995 = (item.release_date ? new Date(item.release_date).getFullYear() >= 1994 : false) ||
                                    (item.first_air_date ? new Date(item.first_air_date).getFullYear() >= 1994 : false); // Verifica se o ano de lançamento é 1995 ou posterior

                return hasBanner && hasVotes && meetsPopularity && isAfter1995;
            });

            // Exibe os resultados filtrados
            displaySearchResults(filteredResults);
            changeView('search'); // Muda para a view de pesquisa
        } else {
            console.error(`Error: ${data.status_message}`);
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}

// Função para compartilhar e limpar a entrada de pesquisa
function handleSearch(inputId) {
    const query = document.getElementById(inputId).value.trim(); // Pega o valor do input
    if (query) {
        searchMoviesAndSeries(query); // Chama a função de busca
        
        // Limpa o input do botão "home" e atualiza o input da página de pesquisa
        if (inputId === 'search-input-home') {
            document.getElementById('search-input-home').value = ''; // Limpa o input do home
            document.getElementById('search-input-search').value = query; // Passa o valor para o input da página de pesquisa
        }
    }
}

// Evento para o botão de busca na página inicial
document.getElementById('search-button-home').addEventListener('click', function() {
    handleSearch('search-input-home'); // Chama a função de manuseio de busca
});

// Evento para o botão de busca na página de pesquisa
document.getElementById('search-button-search').addEventListener('click', function() {
    handleSearch('search-input-search'); // Chama a função de manuseio de busca
});


function displaySearchResults(results) {
    let carousel = document.getElementById('search-results-grid');
    carousel.innerHTML = '';  // Limpa resultados anteriores

    if (results.length === 0) {
        // Exibir mensagem quando não há resultados
        carousel.innerHTML = `
        <div style="width: 100%; height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; position: relative;">
            <span style="font-family: 'Bebas Neue', sans-serif; font-size: 100px; color: #4B0082; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0;">qualiade uanzinflix</span>
            <i class="fas fa-search lupa-animate" style="font-size: 70px; z-index: 1;"></i>
            <div style="font-size: 24px; font-family: 'Bebas Neue', sans-serif; z-index: 1;">Sem resultados</div>
        </div>`;
    } else {
        // Exibir cartões estilizados para cada resultado
results.forEach(item => {
    const isSeries = !!item.first_air_date;
    const year = (isSeries ? item.first_air_date : item.release_date)?.substring(0, 4); // Extrai o ano

    const contentCard = document.createElement('div');
    contentCard.style.cssText = `
        width: 100%; display: flex; align-items: stretch; background-color: rgba(20, 20, 20, 0.9); 
        color: white; margin-bottom: 20px; border-radius: 16px; 
        box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.3); overflow: hidden; transition: transform 0.3s;
    `;

    contentCard.innerHTML = `
        <img src="${item.poster_path ? 'https://image.tmdb.org/t/p/w500' + item.poster_path : ''}" 
             alt="${item.title || item.name}" 
             style="width: 150px; height: auto; object-fit: cover; border-radius: 16px 0 0 16px;">
        <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="flex-grow: 1;">
                <h2 style="font-family: 'Bebas Neue', sans-serif; font-size: 18px; margin: 0; color: #ffffff;">
                    ${item.title || item.name}
                </h2>
                <p style="font-size: 14px; color: #bbb; margin: 5px 0;">
                    ${isSeries ? 'Série' : 'Filme'} | ${year} | Nota: ${item.vote_average.toFixed(1)}
                </p>
                <p style="font-size: 14px; margin: 5px 0; color: #ddd; line-height: 1.4;">
                    ${item.overview.length > 100 ? item.overview.substring(0, 80) + '...' : item.overview}
                </p>
            </div>
            <button style="align-self: flex-start; padding: 10px 20px; font-size: 15px; background-color: #311B92; 
                           color: white; border: none; cursor: pointer; border-radius: 8px; 
                           font-family: 'Bebas Neue', sans-serif; transition: background-color 0.3s;">
                Assistir
            </button>
        </div>`;

    // Adiciona evento de clique no botão "Assistir"
    const watchButton = contentCard.querySelector('button');
    watchButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que o clique no botão acione outros eventos do cartão
        openModal(item, isSeries);
    });

    // Adiciona o cartão ao contêiner
    carousel.appendChild(contentCard);
});

    }
}

function fetchGenres() {
    // Gêneros originais (mantidos intactos)
    fetchContentByGenre(28, '#action-movies');
    fetchContentByGenre(35, '#comedy-movies');
    fetchContentByGenre(18, '#drama-movies');
    fetchContentByGenre(27, '#horror-movies');
    fetchContentByGenre(12, '#adventure-movies');
    fetchContentByGenre(878, '#sci-fi-movies');
    fetchContentByGenre(14, '#fantasy-movies');
    fetchContentByGenre(53, '#thriller-movies');
    fetchContentByGenre(16, '#animation-movies');
    fetchContentByGenre(10752, '#war-movies');
    fetchContentByGenre(99, '#documentary-movies');

    // Novos gêneros adicionados (IDs oficiais TMDB)
    fetchContentByGenre(80, '#crime-movies');        // Crime
    fetchContentByGenre(10751, '#family-movies');    // Família
    fetchContentByGenre(36, '#history-movies');      // História
    fetchContentByGenre(10402, '#music-movies');     // Música
    fetchContentByGenre(9648, '#mystery-movies');    // Mistério
    fetchContentByGenre(10749, '#romance-movies');   // Romance
    fetchContentByGenre(10770, '#tv-movies');        // TV Movie
    fetchContentByGenre(37, '#western-movies');      // Faroeste
}

    document.addEventListener("DOMContentLoaded", () => {
        fetchHighlight();
        fetchGenres();
    });
  document.addEventListener("fullscreenchange", function () {
    // Verifica se o iframe está em tela cheia
    if (document.fullscreenElement && document.fullscreenElement.nodeName === "IFRAME") {
        // Tenta bloquear a orientação da tela para paisagem
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock("landscape").catch(function (error) {
                console.log("Não foi possível bloquear a orientação da tela: ", error);
            });
        }
    } else {
        // Saiu do modo tela cheia, tenta desbloquear a orientação
        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock().catch(function (error) {
                console.log("Não foi possível desbloquear a orientação da tela: ", error);
            });
        }
    }
});
let playerSelectionModal; // Declaração global

async function openContentModal(tmdbId, isSeries, seasonNumber = null, episodeNumber = null) {
    
        // URLs para os players, adaptadas conforme o tipo de conteúdo
    const primaryUrl = isSeries ? 
        (seasonNumber && episodeNumber ? `https://superflixapi.ps/serie/${tmdbId}/${seasonNumber}/${episodeNumber}` : `https://superflixapi.ps/serie/${tmdbId}`) :
        `https://superflixapi.ps/filme/${tmdbId}`;
    
    const secondaryUrl = isSeries ? 
        (seasonNumber && episodeNumber ? `https://supercdn.org/tvshow/${tmdbId}/${seasonNumber}/${episodeNumber}` : `https://supercdn.org/tvshow/${tmdbId}`) :
        `https://supercdn.org/movie/${tmdbId}`;
    
    const tercyUrl = isSeries ? 
        `https://embed.embedplayer.site/serie/${tmdbId}/` :
        `https://embed.embedplayer.site/${tmdbId}`;

// Nova URL SuperflixAPI.dev (3ª Opção)
const superflixApiUrl = isSeries
    ? (seasonNumber && episodeNumber 
        ? `https://superflixapi.dev/serie/${tmdbId}/${seasonNumber}/${episodeNumber}?autoplay=1`
        : (() => { throw new Error('Temporada e episódio são obrigatórios para séries.'); })())
    : `https://superflixapi.dev/filme/${tmdbId}?autoplay=1`;
  
        // Create the player selection modal
        playerSelectionModal = document.createElement('div'); // Use global variable
        playerSelectionModal.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 1000;
        `;
        
        playerSelectionModal.addEventListener('click', function(event) {
            if (event.target === playerSelectionModal) {
                document.body.removeChild(playerSelectionModal);
            }
        });

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            display: flex;
            flex-direction: column;
            position: relative;
            padding: 20px;
            border-radius: 15px;   
        `;

        const videoSource = '';
        const videoElement = document.createElement('video');
        videoElement.src = videoSource;
        videoElement.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 10px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: -1;
        `;
        videoElement.playbackRate = 0.5;
        videoElement.setAttribute('loop', '');

        modalContent.appendChild(videoElement);
        document.body.appendChild(modalContent);

        videoElement.addEventListener('canplaythrough', function() {
            this.play();
        }, false);

        const title = document.createElement('h2');
        title.textContent = "ESCOLHA O SERVIDOR";
        title.style.color = "#fff";
        modalContent.appendChild(title);

    // Botões originais mantidos
    const tercyButton = createPlayerButton("1° Opção", "Menos conteúdo", "fas fa-play", '#4B0082', () => {
        setIframeSrc(tercyUrl);
    });
    modalContent.appendChild(tercyButton);

    const secondaryButton = createPlayerButton("2° Opção", "Mais conteúdo", "fas fa-play", '#4B0082', () => {
        setIframeSrc(secondaryUrl);
    });
    modalContent.appendChild(secondaryButton);

 // Novo botão da SuperflixAPI.dev como 3ª opção
const superflixApiButton = createPlayerButton(
    "3° Opção", 
    "Qualidade uanzinflix", 
    "fas fa-cloud-arrow-up", 
    '#4B0082', 
    () => {
        setIframeSrc(superflixApiUrl);
    }
);
modalContent.appendChild(superflixApiButton);
 
 // Botão 4° Opção - Redirecionar para Webcast
// Botão 4° Opção - Redireciona após carregar o iframe
const castButton = createPlayerButton(
    "4° Opção", 
    "Reproduzir via App", 
    "fas fa-tv", 
    '#FF0000', // Vermelho para identificar visualmente
    () => {
        // Primeiro: carrega o mesmo conteúdo da Superflix Dev
        setIframeSrc(superflixApiUrl);

        // Segundo: aguarda o iframe carregar para capturar o src real
        const iframe = document.getElementById('contentFrame');
        let checkLoaded = setInterval(() => {
            if (iframe.src && iframe.src.includes("superflixapi.dev")) {
                clearInterval(checkLoaded);

                // Terceiro: redireciona para webcast://...
                const webcastUrl = `webcast://watch?url=${encodeURIComponent(iframe.src)}`;
                window.location.href = webcastUrl;
            }
        }, 500); // Checa a cada 500ms se o iframe carregou
    }
);
modalContent.appendChild(castButton);

        playerSelectionModal.appendChild(modalContent);
        document.body.appendChild(playerSelectionModal);

        function setIframeSrc(url) {
            const iframe = document.getElementById('contentFrame');
            if (iframe) {
                iframe.src = url;
            }

            const contentModal = document.getElementById('contentModal');
            if (contentModal) {
                contentModal.style.display = "flex";
            }

            document.body.removeChild(playerSelectionModal);
        }
}

function createPlayerButton(label, description, iconClass, color, onClick) {
    const button = document.createElement('button');
    button.style.cssText = `
        padding: 10px 20px;
        margin-top: 10px;
        border: none;
        border-radius: 20px;
        background-color: ${color};
        color: #fff;
        font-family: Arial, sans-serif;
        font-size: 16px;
        cursor: pointer;
        text-align: center;
    `;

    const icon = document.createElement('i');
    icon.className = iconClass;
    icon.style.marginRight = "5px";
    button.appendChild(icon);

    const labelText = document.createTextNode(label);
    button.appendChild(labelText);

    // Cria o elemento 'small' para a descrição e adiciona uma quebra de linha
    const descriptionElement = document.createElement('small');
    descriptionElement.style.fontSize = "10px";
    descriptionElement.style.display = "block"; // Exibir em nova linha
    descriptionElement.textContent = description;
    button.appendChild(descriptionElement);

    button.onclick = onClick;

    return button;
}


function hideContentModal() {
    const modal = document.getElementById('contentModal');
    modal.style.display = "none";
    document.getElementById('contentFrame').src = ''; // Limpa o src do iframe ao fechar
}

const ratingIcons = {
    L: 'img/classifications/livre.svg',
    '10': 'img/classifications/dez_y.svg',
    '12': 'img/classifications/doze_y.svg',
    '14': 'img/classifications/quatorze_y.svg',
    '16': 'img/classifications/dezesseis_y.svg',
    '18': 'img/classifications/dezoito_y.svg',
    Indisponível: 'img/classifications/quatorze_y.svg'
};


async function openModal(content, isSeries) {
    const modal = document.getElementById('modal');
    const modalCont = modal.querySelector('.modal-content');
    const detailsUrl = isSeries ?
        `https://api.themoviedb.org/3/tv/${content.id}?api_key=${apiKey}&language=pt-BR` :
        `https://api.themoviedb.org/3/movie/${content.id}?api_key=${apiKey}&language=pt-BR`;

    const creditsUrl = isSeries ?
        `https://api.themoviedb.org/3/tv/${content.id}/credits?api_key=${apiKey}&language=pt-BR` :
        `https://api.themoviedb.org/3/movie/${content.id}/credits?api_key=${apiKey}&language=pt-BR`;

    const ratingsUrl = isSeries ?
        `https://api.themoviedb.org/3/tv/${content.id}/content_ratings?api_key=${apiKey}&language=pt-BR` :
        `https://api.themoviedb.org/3/movie/${content.id}/release_dates?api_key=${apiKey}&language=pt-BR`;

    const imagesUrl = isSeries ?
        `https://api.themoviedb.org/3/tv/${content.id}/images?api_key=${apiKey}` :
        `https://api.themoviedb.org/3/movie/${content.id}/images?api_key=${apiKey}`;

    const isSaved = await isItemSaved(content.id); // Verifica se o item já está salvo
    Promise.all([
        fetch(detailsUrl).then(response => response.json()),
        fetch(creditsUrl).then(response => response.json()),
        fetch(ratingsUrl).then(response => response.json()),
        fetch(imagesUrl).then(response => response.json())
    ]).then(([details, credits, ratings, images]) => {
        displaySimilarMovies(content.id, isSeries, details.backdrop_path);

        let classification = 'Indisponível';
        if (isSeries) {
            const brazilRating = ratings.results.find(r => r.iso_3166_1 === 'BR');
            classification = brazilRating ? brazilRating.rating : 'Indisponível';
        } else {
            const brazilRelease = ratings.results.find(r => r.iso_3166_1 === 'BR');
            if (brazilRelease) {
                const brazilCertification = brazilRelease.release_dates.find(rd => rd.certification);
                classification = brazilCertification ? brazilCertification.certification : 'Indisponível';
            }
        }

        const iconUrl = ratingIcons[classification] || ratingIcons['Indisponível'];

        // Verificar logotipos para obter o logotipo em português ou, se não disponível, em inglês.
        const logo = images.logos.find(l => l.iso_639_1 === 'pt') || images.logos.find(l => l.iso_639_1 === 'en');
        const logoUrl = logo ? `https://image.tmdb.org/t/p/w1280${logo.file_path}` : null;

        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
        <div style="width: 100%; height: 45vh; position: relative; text-align: center;">
            <img src="${baseImgUrlModal}${details.backdrop_path}" alt="Banner" 
                style="width: 100%; height: 100%; 
                       border-bottom-left-radius: 20px; 
                       border-bottom-right-radius: 20px; 
                       box-shadow: 0 10px 20px rgba(0, 0, 0, 0.8);">
            
            <!-- Logotipo do filme centralizado na parte inferior -->
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo do Filme" style="position: absolute; bottom: 10px; 
                 left: 50%; transform: translateX(-50%); max-width: 80%; max-height: 20vh;">` : ''}
            <button id="saveButton" style="
                position: absolute; bottom: 20px; right: 20px;
                padding: 10px; border: none; border-radius: 50%;
                background-color: rgba(20, 20, 20, 0.85); cursor: pointer;
            " onclick="toggleSave(${content.id}, '${content.title || content.name}', ${isSeries}, '${content.poster_path || content.backdrop_path}')">
                <i class="fas fa-bookmark" style="
                    font-size: 24px;
                    color: ${isSaved ? 'gold' : 'white'};
                "></i>
            </button>
           
        </div>

        <!-- Título e informações adicionais -->
        <h2 style="margin: 10px 0 5px 10px; color: #f0f0f0; font-size: 24px; font-family: 'Bebas Neue', cursive;">
    ${content.title || content.name}
</h2> <div style="display: flex; align-items: center; padding: 5px 10px; font-size: 14px; color: #f0f0f0; gap: 15px; line-height: 1.2;">
            <p style="margin: 0;">${isSeries ? `SÉRIE` : `FILME`}</p>
            <p style="margin: 0;">${new Date(details.release_date || details.first_air_date).getFullYear()}</p>
            <p style="margin: 0;">${isSeries ? `${details.number_of_seasons} temporada(s)` : `${Math.floor(details.runtime / 60)}h ${(details.runtime % 60)}min`}</p>
            <p style="margin: 0;">⭐ ${details.vote_average.toFixed(1)}</p>
            <p style="margin: 0;">${details.genres.map(genre => genre.name).join(', ')}</p>
            <p style="margin: 0;">
                <img src="${iconUrl}" alt="Classificação" style="width: 20px; height: 20px; vertical-align: middle;">
            </p>
        </div>
        <p class="tagline" style="display: ${new Date() < new Date(details.release_date || details.first_air_date) ? 'flex' : 'none'}; 
            align-items: center; justify-content: center; font-size: 0.9em; font-weight: 500; color: #000000; background-color: #4A148C; 
            padding: 10px 14px; border-radius: 8px; box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15); text-align: center; gap: 8px; margin: 5px 0;">
            <span style="display: flex; align-items: center; gap: 4px;">
                <img src="img/calendar_icon.svg" alt="Ícone de Calendário" width="16" height="16" style="fill: currentColor;" />
                <span>
                    Aguardando Lançamento: 
                    ${new Date(new Date(details.release_date || details.first_air_date).setDate(new Date(details.release_date || details.first_air_date).getDate() + 2)).toLocaleDateString('pt-BR')}
                </span>
            </span>
        </p>
        <div class="modal-button"></div>
        <!-- Sinopse -->
        <div style="margin: 10px; padding: 10px; font-size: 16px; color: #f0f0f0; background-color: rgba(20, 20, 20, 0.85); text-align: left; line-height: 1.4; border-radius: 10px;">
            <p style="margin: 5px 0;"><i class="fas fa-book-open" style="color: #311B92;"></i><strong> Sinopse:</strong> ${details.overview}</p>
        </div>

        <!-- Elenco -->
        <div style="background-color: rgba(20, 20, 20, 0.85); border-radius: 10px; padding: 10px; overflow-x: auto; margin-top: 10px;">
            <strong style="color: #f0f0f0;">Elenco:</strong>
            <div style="display: flex; align-items: center; font-size: 12px;">
                ${credits.cast.slice(0, 10).map(actor => `
                    <div style="margin-right: 10px; text-align: center;">
                        <img src="${baseImgUrl}${actor.profile_path}" alt="${actor.name}" style="width: 80px; height: 80px; border-radius: 15%; object-fit: cover;">
                        <p style="color: #f0f0f0; font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${actor.name.split(' ').slice(0, 2).join(' ')}
                        </p>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
        if (isSeries) {
    displaySeasons(content.id); // Chama a função para exibir as temporadas
}
        prepareButtons(content, isSeries);
    });

    modal.style.display = "flex";
    // Rola a .modal-content para o topo assim que o modal for aberto
    modalCont.scrollTop = 0;
    const closeButton = modal.querySelector('.close-button');
    closeButton.onclick = () => { modal.style.display = "none"; };

    // Aqui, implementamos o comportamento do botão "Voltar"
    const backButtonListener = (e) => {
        if (modal.style.display === "flex") {
            e.preventDefault(); // Impede o comportamento padrão de voltar
            modal.style.display = "none"; // Fecha o modal
        } else {
            // Se o modal não estiver aberto, o comportamento normal de voltar é executado
            document.removeEventListener("backbutton", backButtonListener); // Remove o listener quando o modal for fechado
        }
    };

    document.addEventListener("backbutton", backButtonListener, false);

}

function displaySeasons(seriesId) {
    const seasonsUrl = `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}&language=pt-BR`;
    fetch(seasonsUrl)
        .then(response => response.json())
        .then(series => {
            const seasons = series.seasons.filter(season => season.season_number !== 0); // Excluir season 0
            const modalBody = document.querySelector('.modal-body');

            // Limpar todo o conteúdo do modal antes de adicionar novo
            modalBody.innerHTML = '';

            // Adicionar informações da série (título, imagem, descrição)
            const posterPath = series.poster_path ? `https://image.tmdb.org/t/p/w300${series.poster_path}` : '';
            const backdropPath = series.backdrop_path ? `https://image.tmdb.org/t/p/original${series.backdrop_path}` : '';

            // Título e descrição
            const titleElement = document.createElement('h2');
            titleElement.textContent = series.name;
            titleElement.style.color = '#fff';
            titleElement.style.textAlign = 'center';
            titleElement.style.marginTop = '0';

            const overviewElement = document.createElement('p');
            overviewElement.textContent = series.overview || 'Descrição indisponível.';
            overviewElement.style.color = '#ccc';
            overviewElement.style.textAlign = 'justify';
            overviewElement.style.maxWidth = '90%';
            overviewElement.style.margin = '10px auto';

            // Imagem da série
            const imageElement = document.createElement('img');
            imageElement.src = posterPath;
            imageElement.alt = series.name;
            imageElement.style.width = '100%';
            imageElement.style.height = 'auto';
            imageElement.style.borderRadius = '8px';
            imageElement.style.marginBottom = '10px';

            // Background da série
            const backgroundElement = document.createElement('div');
            backgroundElement.style.backgroundImage = `url(${backdropPath})`;
            backgroundElement.style.backgroundSize = 'cover';
            backgroundElement.style.backgroundPosition = 'center';
            backgroundElement.style.height = '200px';
            backgroundElement.style.borderRadius = '8px';
            backgroundElement.style.position = 'relative';

            // Inserir elementos no início do modal
            modalBody.appendChild(backgroundElement);
            modalBody.appendChild(titleElement);
            modalBody.appendChild(imageElement);
            modalBody.appendChild(overviewElement);

            // Criar container para as temporadas
            const seasonsContainer = document.createElement('div');
            seasonsContainer.id = 'seasons-container';
            seasonsContainer.style.display = 'flex';
            seasonsContainer.style.flexDirection = 'row';
            seasonsContainer.style.backgroundColor = 'rgba(20, 20, 20, 0.85)';
            seasonsContainer.style.gap = '10px';
            seasonsContainer.style.border = 'none';
            seasonsContainer.style.margin = '10px';
            seasonsContainer.style.overflowX = 'auto';
            seasonsContainer.style.padding = '10px';
            seasonsContainer.style.scrollBehavior = 'smooth';
            seasonsContainer.style.justifyContent = 'flex-start';
            modalBody.appendChild(seasonsContainer);

            // Adicionar botões de temporada
            seasons.forEach((season, index) => {
                const seasonButton = document.createElement('button');
                seasonButton.innerText = `Season ${season.season_number}`;
                seasonButton.style.padding = '10px 20px';
                seasonButton.style.backgroundColor = '#333';
                seasonButton.style.color = '#fff';
                seasonButton.style.border = 'none';
                seasonButton.style.borderRadius = '5px';
                seasonButton.style.cursor = 'pointer';
                seasonButton.style.fontSize = '16px';
                seasonButton.style.margin = '5px';

                // Adicionar highlight na temporada selecionada
                seasonButton.onclick = () => {
                    const allButtons = seasonsContainer.querySelectorAll('button');
                    allButtons.forEach(btn => {
                        btn.style.backgroundColor = '#333';
                    });
                    seasonButton.style.backgroundColor = '#4B0082';
                    displayEpisodes(season, seriesId);
                };

                seasonsContainer.appendChild(seasonButton);
            });

            // Destacar a primeira temporada por padrão
            if (seasons.length > 0) {
                const firstSeasonButton = seasonsContainer.querySelector('button');
                firstSeasonButton.style.backgroundColor = '#4B0082';
                displayEpisodes(seasons[0], seriesId);

                // Garantir que a rolagem comece no início
                seasonsContainer.scrollLeft = 0;
            }
        })
        .catch(error => console.error('Erro ao carregar temporadas:', error));
}




function displayEpisodes(season, seriesId) {
    const episodesUrl = `https://api.themoviedb.org/3/tv/${seriesId}/season/${season.season_number}?api_key=${apiKey}&language=pt-BR`;

    fetch(episodesUrl)
        .then(response => response.json())
        .then(seasonDetails => {
            const modalBody = document.querySelector('.modal-body');
            
            // Limpar qualquer conteúdo existente
            const existingEpisodes = modalBody.querySelector('.episodes');
            if (existingEpisodes) {
                existingEpisodes.remove();
            }

            // Criar container para os episódios
            const episodesContainer = document.createElement('div');
            episodesContainer.classList.add('episodes');
            episodesContainer.style.marginTop = '20px';
            
            seasonDetails.episodes.forEach(episode => {
                const episodeDiv = document.createElement('div');
                episodeDiv.style.display = 'flex';
                episodeDiv.style.alignItems = 'center';
                episodeDiv.style.marginBottom = '10px'; 
                episodeDiv.style.padding = '10px'; 
                episodeDiv.style.backgroundColor = 'rgba(20, 20, 20, 0.85)';
                episodeDiv.style.borderRadius = '10px';
                
                const episodeImage = document.createElement('img');
                episodeImage.src = `${baseImgUrl}${episode.still_path}`;
                episodeImage.alt = episode.name;
                episodeImage.style.width = '80px';
                episodeImage.style.height = '80px';
                episodeImage.style.borderRadius = '8px';
                episodeImage.style.marginRight = '15px';
                
                const episodeInfo = document.createElement('div');
                episodeInfo.style.flex = '1';
                
                // Exibir o número do episódio
                const episodeNumber = document.createElement('span');
                episodeNumber.innerText = `Episódio ${episode.episode_number}`;
                episodeNumber.style.color = '#4B0082';
                episodeNumber.style.fontSize = '14px';
                episodeNumber.style.marginBottom = '5px';
                episodeNumber.style.display = 'block'; 
                
                const episodeTitle = document.createElement('h4');
                episodeTitle.innerText = episode.name;
                episodeTitle.style.color = '#4B0082';
                episodeTitle.style.fontSize = '16px';
                episodeTitle.style.marginBottom = '3px'; 
                episodeTitle.style.lineHeight = '1.2'; 
                
                const episodeDescription = document.createElement('p');
                episodeDescription.innerText = episode.overview ? episode.overview.substring(0, 120) + '...' : 'Sem descrição disponível';
                episodeDescription.style.color = '#aaa';
                episodeDescription.style.fontSize = '14px';
                episodeDescription.style.lineHeight = '1.3'; 

                // Criar o botão de "assistir"
                const watchButton = document.createElement('button');
                watchButton.style.backgroundColor = '#4B0082';
                watchButton.style.border = 'none';
                watchButton.style.borderRadius = '10px';
                watchButton.style.width = '120px';
                watchButton.style.height = 'auto'; // Ajuste dinâmico de altura
                watchButton.style.padding = '5px';
                watchButton.style.display = 'flex';
                watchButton.style.flexDirection = 'column';
                watchButton.style.alignItems = 'center';
                watchButton.style.justifyContent = 'center';
                watchButton.style.cursor = 'pointer';
                watchButton.style.overflow = 'hidden'; // Impede o transbordamento do conteúdo

                // Ícone de "assistir"
                const watchIcon = document.createElement('i');
                watchIcon.classList.add('fas', 'fa-play');
                watchIcon.style.color = 'white';
                watchIcon.style.fontSize = '24px';
                watchIcon.style.marginBottom = '5px'; 
                watchButton.appendChild(watchIcon);

                // Texto "Assistir"
                const watchText = document.createElement('span');
                watchText.textContent = 'Assistir';
                watchText.style.color = 'white';
                watchText.style.fontSize = '14px';
                watchButton.appendChild(watchText);

                // Adicionar o texto "Aceitar anúncio" com o ícone
                const adText = document.createElement('div');
                adText.style.display = 'flex';
                adText.style.alignItems = 'center';
                adText.style.marginTop = '5px';
                adText.style.fontSize = '12px';
                adText.style.color = 'white';

                const adIcon = document.createElement('i');
                adIcon.classList.add('fas', 'fa-ad');
                adIcon.style.marginRight = '5px';

                const adLabel = document.createElement('span');
                adLabel.textContent = 'uanzinflix';

                adText.appendChild(adIcon);
                adText.appendChild(adLabel);

                // Adicionar o texto "Aceitar anúncio" ao botão
                watchButton.appendChild(adText);

                // Chamar função openContentModalByEp ao clicar no botão
                watchButton.onclick = () => {
                    // ANUNCIOS
                    var rewardID = "ca-app-pub-6784032070981923/9055243843";
                    adMob.rewarded(rewardID).then(function(){
                        console.log("loaded rewarded ads");
                        return adMob.showRewarded();
                    }).then(function(reward){
                        console.log("ANUNCIO DA FUNÇÃO");
                    }).catch(function(err){
                        console.log("error anun func");
                    });
                    openContentModal(seriesId, true, season.season_number, episode.episode_number);
                };

                episodeInfo.appendChild(episodeNumber); 
                episodeInfo.appendChild(episodeTitle);
                episodeInfo.appendChild(episodeDescription);
                episodeDiv.appendChild(episodeImage);
                episodeDiv.appendChild(episodeInfo);
                episodeDiv.appendChild(watchButton);

                episodesContainer.appendChild(episodeDiv);
            });

            modalBody.appendChild(episodesContainer);
        })
        .catch(error => console.error('Erro ao carregar episódios:', error));
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('WatchLaterDB', 1);

        // Criar o objectStore para salvar itens de "assistir depois" se não existir
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('watchLater')) {
                db.createObjectStore('watchLater', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}
// Função para salvar um item no IndexedDB
async function saveToWatchLater(item) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('watchLater', 'readwrite');
        const store = transaction.objectStore('watchLater');
        const request = store.put(item); // 'put' adiciona ou atualiza
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(false);
    });
}

// Função para verificar se o item já está salvo no IndexedDB
async function isItemSaved(id) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('watchLater', 'readonly');
        const store = transaction.objectStore('watchLater');
        const request = store.get(id); // Busca pelo 'id'
        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => reject(false);
    });
}

// Função para remover um item do IndexedDB
async function removeFromWatchLater(id) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('watchLater', 'readwrite');
        const store = transaction.objectStore('watchLater');
        const request = store.delete(id); // Remove pelo 'id'
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(false);
    });
}

async function toggleSave(id, title, isSeries, imagePath) {
    const itemToSaveWatchLater = {
        id: id,
        title: title,
        isSeries: isSeries,
        imagePath: imagePath
    };

    const isSaved = await isItemSaved(id); // Verifica se o item já está salvo
    const saveIcon = document.querySelector('#saveButton i'); // Referência ao ícone do botão

    if (isSaved) {
        // Remover do IndexedDB
        await removeFromWatchLater(id);
        saveIcon.style.color = 'white'; // Preto (não salvo)
        showToast('Item removido');
    } else {
        // Salvar no IndexedDB
        await saveToWatchLater(itemToSaveWatchLater);
        saveIcon.style.color = 'gold'; // Vermelho (salvo)
        showToast('Item salvo');
    }
}
async function displaySavedItems() {
    const db = await openDatabase();
    const items = await getAllSavedItems(); // Obtém os itens salvos
    const container = document.querySelector('#savedItemsContainer'); // Container para exibir os cards
    container.innerHTML = ''; // Limpa o container

     // Verifica se a lista está vazia
        if (items.length === 0) {
            // Exibe a mensagem "Lista Vazia" com o ícone de adicionar
            container.innerHTML = `
                <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; text-align: center;">
                    <h2 style="font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #ffffff; margin-bottom: 20px;">
                        Lista Vazia
                    </h2>
                    <p style="font-size: 18px; color: #bbb; margin-bottom: 30px;">
                        Adicione itens à sua lista para não esquecer de assistir
                    </p>
                    <span style="font-size: 40px; color: #4A148C;">+</span>
                </div>
            `;
            return;
        }

    for (const item of items) {
        const { id, isSeries, imagePath } = item;

        // Busca os detalhes do TMDb usando o ID
        const tmdbData = await fetchTMDbDetails(id, isSeries);

        // Cria o card com as informações
        const card = document.createElement('div');
        card.style.cssText = `
            width: 100%; display: flex; align-items: center; background-color: rgba(20, 20, 20, 0.9);
            color: white; margin-bottom: 20px; height: 200px; border-radius: 16px;
            box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.3); overflow: hidden; transition: transform 0.3s;
        `;
        
        // Verifica se a imagem está disponível, se não, usa uma imagem padrão
        const imageUrl = tmdbData.imageUrl ? `https://image.tmdb.org/t/p/w500${tmdbData.imageUrl}` : '';

        card.innerHTML = `
            <img src="${imageUrl}" 
                 alt="${tmdbData.title}" 
                 style="width: 150px; height: 100%; object-fit: cover; border-radius: 16px 0 0 16px;">
            <div style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <h2 style="font-family: 'Bebas Neue', sans-serif; font-size: 18px; margin: 0; color: #ffffff;">
                        ${tmdbData.title}
                    </h2>
                    <p style="font-size: 14px; color: #bbb; margin: 5px 0;">
                        ${isSeries ? 'Série' : 'Filme'} | ${tmdbData.year} | Nota: ${tmdbData.vote_average.toFixed(1)}
                    </p>
                    <p style="font-size: 15px; margin: 5px 0; color: #ddd; line-height: 1.4;">
                        ${tmdbData.overview.length > 100 ? tmdbData.overview.substring(0, 80) + '...' : tmdbData.overview}
                    </p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button style="align-self: flex-start; padding: 10px 20px; font-size: 15px; background-color: #4A148C; 
                                  color: white; border: none; cursor: pointer; border-radius: 8px; 
                                  font-family: 'Bebas Neue', sans-serif; transition: background-color 0.3s;"
                            onclick="openModalFromRecent(${id}, ${isSeries})">
                        Assistir
                    </button>
                    <button style="align-self: flex-start; padding: 10px 20px; font-size: 15px; background-color: #444444; 
                                  color: white; border: none; cursor: pointer; border-radius: 8px; 
                                  font-family: 'Bebas Neue', sans-serif; transition: background-color 0.3s;"
                            onclick="removeItem(${id})">
                        Remover
                    </button>
                </div>
            </div>
        `;
        // Adiciona o card ao container
        container.appendChild(card);
    }
}


// Função para remover o item
async function removeItem(id) {
    // Remover o item do banco de dados
    await removeFromWatchLater(id);
    showToast('Item removido');
    // Recarregar a lista de itens após a remoção
    displaySavedItems();
}
async function getAllSavedItems() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('watchLater', 'readonly');
        const store = transaction.objectStore('watchLater');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject([]);
    });
}

async function fetchTMDbDetails(id, isSeries) {
    const type = isSeries ? 'tv' : 'movie';
    const response = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&language=pt-BR`);
    
    // Verifica se a resposta da API foi bem-sucedida
    if (!response.ok) {
        console.error('Erro ao buscar detalhes do TMDb:', response.statusText);
        return {}; // Retorna um objeto vazio em caso de erro
    }

    const data = await response.json();

    // Checa se os campos estão presentes antes de tentar usá-los
    const title = data.title || data.name || 'Título desconhecido';
    const imageUrl = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'path/to/default-image.jpg'; // Imagem padrão se não houver imagem

    // Outros campos podem ser adicionados, como 'overview' ou 'release_date', se desejado
    const overview = data.overview || 'Descrição não disponível';
    const year = data.release_date ? data.release_date.substring(0, 4) : (data.first_air_date ? data.first_air_date.substring(0, 4) : 'Ano desconhecido');
    const vote_average = data.vote_average || 0;

    return {
        title,
        imageUrl,
        overview,
        year,
        vote_average
    };
}

function showToast(message, time = 3000) {
    const toast = document.getElementById('toast');

    // Define a mensagem do toast
    toast.textContent = message;

    // Adiciona a classe 'show' para exibir o toast
    toast.classList.add('show');

    // Remove o toast após time segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, time);
}


function prepareButtons(content, isSeries) {
    const modalContent = document.querySelector('.modal-button');

    // Cria ou seleciona o contêiner para os botões, garantindo que eles fiquem lado a lado.
    let buttonsContainer = modalContent.querySelector('.buttons-container');
    if (!buttonsContainer) {
        buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons-container';
        modalContent.appendChild(buttonsContainer); // Adiciona o contêiner ao modal
    }

    // Verifica e cria, se necessário, o "Assistir".
    let watchButton = buttonsContainer.querySelector('.player-button');
    if (!watchButton) {
        watchButton = document.createElement('button');
        watchButton.className = 'player-button';
        watchButton.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
            <span><i class="fas fa-play"></i> Assistir</span>
            <span style="font-size: 12px; color: white;">
                <i class="fas fa-ad"></i> Caso Seja serie, escolha uma Temporada
            </span>
        </div>
    `;   
        buttonsContainer.appendChild(watchButton); // Adiciona o "Assistir" ao contêiner dos botões
    }

watchButton.onclick = () => {
  saveToRecentlyWatched(content);
    // ANUNCIOS
    var rewardID = "ca-app-pub-6784032070981923/9055243843";
    adMob.rewarded(rewardID).then(function(){
        console.log("loaded rewarded ads");
        return adMob.showRewarded();
    }).then(function(reward){
        console.log("ANUNCIO DA FUNÇÃO");
    }).catch(function(err){
        console.log("error anun func");
    });
    if (isSeries) {
        openContentModal(content.id, isSeries); 
    } else {
        const imdbIdUrl = `https://api.themoviedb.org/3/movie/${content.id}/external_ids?api_key=${apiKey}`;
        fetch(imdbIdUrl)
            .then(response => response.json())
            .then(data => {
                if (data.imdb_id) {
                    openContentModal(data.imdb_id, false);        
                } else {
                    alert("ID do IMDb não encontrado.");
                }
            }).catch(error => console.error("Erro ao buscar ID do IMDb:", error));
    }

};

    // Verifica e cria, se necessário, o botão "Trailer".
    let trailerButton = buttonsContainer.querySelector('.trailer-button');
    if (!trailerButton) {
        trailerButton = document.createElement('button');
        trailerButton.className = 'trailer-button';
        trailerButton.innerHTML = '<i class="fas fa-video"></i> Trailer';
        buttonsContainer.appendChild(trailerButton); // Adiciona o "Trailer" ao contêiner dos botões
    }

    // Define a ação do botão "Trailer".
    trailerButton.onclick = () => {
    const trailerUrl = isSeries ?
        `https://api.themoviedb.org/3/tv/${content.id}/videos?api_key=${apiKey}&language=pt-BR` :
        `https://api.themoviedb.org/3/movie/${content.id}/videos?api_key=${apiKey}&language=pt-BR`;

    fetch(trailerUrl)
        .then(response => response.json())
        .then(data => {
            const trailer = data.results.find(video => video.type === "Trailer" && video.iso_639_1 === "pt");
            if (trailer) {
                const videoUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
                window.open(videoUrl, '_blank');
            } else {
              // Tenta buscar trailer em inglês se não encontrar em português
                const trailerUrlFallback = isSeries ?
                    `https://api.themoviedb.org/3/tv/${content.id}/videos?api_key=${apiKey}&language=en-US` :
                    `https://api.themoviedb.org/3/movie/${content.id}/videos?api_key=${apiKey}&language=en-US`;

                fetch(trailerUrlFallback)
                    .then(response => response.json())
                    .then(data => {
                        const trailerFallback = data.results.find(video => video.type === "Trailer");
                        if (trailerFallback) {
                            const videoUrlFallback = `https://www.youtube.com/watch?v=${trailerFallback.key}`;
                            window.open(videoUrlFallback, '_blank');
                        } else {
                            alert("Trailer não encontrado.");
                        }
                    });
            }
        }).catch(error => {
            console.error("Erro ao buscar trailer:", error);
            //alert("Erro ao buscar trailer.");
        });
};
}
  document.addEventListener("DOMContentLoaded", () => {
    displayRecentlyWatched();
});
function saveToRecentlyWatched(content) {
    if (!content || !content.id || !(content.title || content.name) || !content.poster_path) {
           return;  // Garante que todos os dados necessários estão presentes
    }

    let watchedItems = JSON.parse(localStorage.getItem('recentlyWatched')) || [];
    const itemToSave = {
        id: content.id,
        title: content.title || content.name,  // Assume que séries usam 'name' e filmes 'title'
        isSeries: 'first_air_date' in content,  // Usa uma propriedade única para séries para identificação
        imagePath: content.poster_path || content.backdrop_path  // Garante que qualquer imagem válida seja usada
    };

    // Remoção de duplicatas
    watchedItems = watchedItems.filter(item => item.id !== content.id);

    // Adiciona o novo item no começo da lista
    watchedItems.unshift(itemToSave);

    // Mantém apenas os últimos 20 itens
    watchedItems = watchedItems.slice(0, 10);

    localStorage.setItem('recentlyWatched', JSON.stringify(watchedItems));
}
// === REGRA 4: Atualização do Histórico (Versão Compatível) ===
function displayRecentlyWatched() {
    const watchedItems = JSON.parse(localStorage.getItem('recentlyWatched')) || [];
    const container = document.getElementById('recently-watched-container');
    container.innerHTML = '';

    watchedItems.forEach(item => {
        // 1. Criar card usando a função padronizada
        const card = createContentCard({
            id: item.id,
            title: item.title,
            poster_path: item.imagePath
        }, item.isSeries);

        // 2. Adicionar ícone de relógio
        const clockIcon = document.createElement('i');
        clockIcon.classList.add('fas', 'fa-history');
        clockIcon.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 30px;
            color: #C0C0C0;
            z-index: 2;
        `;

        // 3. Anexar ao container da imagem
        card.querySelector('.movie-card').appendChild(clockIcon);

        // 4. Manter evento de clique
        card.addEventListener('click', () => openModalFromRecent(item.id, item.isSeries));

        container.appendChild(card);
    });
}

async function openModalFromRecent(id, isSeries) {
    const modal = document.getElementById('modal');
    const modalCont = modal.querySelector('.modal-content');
  
    const detailsUrl = isSeries ?
        `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=pt-BR` :
        `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=pt-BR`;

    const creditsUrl = isSeries ?
        `https://api.themoviedb.org/3/tv/${id}/credits?api_key=${apiKey}&language=pt-BR` :
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}&language=pt-BR`;

    const ratingsUrl = isSeries ?
        `https://api.themoviedb.org/3/tv/${id}/content_ratings?api_key=${apiKey}&language=pt-BR` :
        `https://api.themoviedb.org/3/movie/${id}/release_dates?api_key=${apiKey}&language=pt-BR`;

    const imagesUrl = isSeries ?
        `https://api.themoviedb.org/3/tv/${id}/images?api_key=${apiKey}` :
        `https://api.themoviedb.org/3/movie/${id}/images?api_key=${apiKey}`;

    const isSaved = await isItemSaved(id); // Verifica se o item já está salvo
    Promise.all([
        fetch(detailsUrl).then(response => response.json()),
        fetch(creditsUrl).then(response => response.json()),
        fetch(ratingsUrl).then(response => response.json()),
        fetch(imagesUrl).then(response => response.json())
    ]).then(([details, credits, ratings, images]) => {
        displaySimilarMovies(details.id, isSeries, details.backdrop_path);

        let classification = 'Indisponível';
        if (isSeries) {
            const brazilRating = ratings.results.find(r => r.iso_3166_1 === 'BR');
            classification = brazilRating ? brazilRating.rating : 'Indisponível';
        } else {
            const brazilRelease = ratings.results.find(r => r.iso_3166_1 === 'BR');
            if (brazilRelease) {
                const brazilCertification = brazilRelease.release_dates.find(rd => rd.certification);
                classification = brazilCertification ? brazilCertification.certification : 'Indisponível';
            }
        }

        const iconUrl = ratingIcons[classification] || ratingIcons['Indisponível'];

        // Verificar logotipos para obter o logotipo em português ou, se não disponível, em inglês.
        const logo = images.logos.find(l => l.iso_639_1 === 'pt') || images.logos.find(l => l.iso_639_1 === 'en');
        const logoUrl = logo ? `https://image.tmdb.org/t/p/w1280${logo.file_path}` : null;

        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
        <div style="width: 100%; height: 45vh; position: relative; text-align: center;">
            <img src="${baseImgUrlModal}${details.backdrop_path}" alt="Banner" 
                style="width: 100%; height: 100%; 
                       border-bottom-left-radius: 20px; 
                       border-bottom-right-radius: 20px; 
                       box-shadow: 0 10px 20px rgba(0, 0, 0, 0.8);">
            
            <!-- Logotipo do filme centralizado na parte inferior -->
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo do Filme" style="position: absolute; bottom: 10px; 
                 left: 50%; transform: translateX(-50%); max-width: 80%; max-height: 20vh;">` : ''}
            <button id="saveButton" style="
                position: absolute; bottom: 20px; right: 20px;
                padding: 10px; border: none; border-radius: 50%;
                background-color: rgba(20, 20, 20, 0.85); cursor: pointer;
            " onclick="toggleSave(${id}, '${details.title || details.name}', ${isSeries}, '${details.poster_path || details.backdrop_path}')">
                <i class="fas fa-bookmark" style="
                    font-size: 24px;
                    color: ${isSaved ? 'gold' : 'white'}; /* Vermelho: Salvo, Preto: Não salvo */
                "></i>
            </button>
           
        </div>

        <!-- Título e informações adicionais -->
        <h2 style="margin: 10px 0 5px 10px; color: #f0f0f0; font-size: 24px; font-family: 'Bebas Neue', cursive;">
    ${details.title || details.name}
</h2>    <div style="display: flex; align-items: center; padding: 5px 10px; font-size: 14px; color: #f0f0f0; gap: 15px; line-height: 1.2;">
            <p style="margin: 0;">${isSeries ? `SÉRIE` : `FILME`}</p>
            <p style="margin: 0;">${new Date(details.release_date || details.first_air_date).getFullYear()}</p>
            <p style="margin: 0;">${isSeries ? `${details.number_of_seasons} temporada(s)` : `${Math.floor(details.runtime / 60)}h ${(details.runtime % 60)}min`}</p>
            <p style="margin: 0;">⭐ ${details.vote_average.toFixed(1)}</p>
            <p style="margin: 0;">${details.genres.map(genre => genre.name).join(', ')}</p>
            <p style="margin: 0;">
                <img src="${iconUrl}" alt="Classificação" style="width: 20px; height: 20px; vertical-align: middle;">
            </p>
        </div>
        <p class="tagline" style="display: ${new Date() < new Date(details.release_date || details.first_air_date) ? 'flex' : 'none'}; 
            align-items: center; justify-content: center; font-size: 0.9em; font-weight: 500; color: #000000; background-color: #4A148C; 
            padding: 10px 14px; border-radius: 8px; box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15); text-align: center; gap: 8px; margin: 5px 0;">
            <span style="display: flex; align-items: center; gap: 4px;">
                <img src="img/calendar_icon.svg" alt="Ícone de Calendário" width="16" height="16" style="fill: currentColor;" />
                <span>
                    Aguardando Lançamento: 
                    ${new Date(new Date(details.release_date || details.first_air_date).setDate(new Date(details.release_date || details.first_air_date).getDate() + 2)).toLocaleDateString('pt-BR')}
                </span>
            </span>
        </p>
        <div class="modal-button"></div>
        <!-- Sinopse -->
        <div style="margin: 10px; padding: 10px; font-size: 16px; color: #f0f0f0; background-color: rgba(20, 20, 20, 0.85); text-align: left; line-height: 1.4; border-radius: 10px;">
            <p style="margin: 5px 0;"><i class="fas fa-book-open" style="color: #311B92;"></i><strong> Sinopse:</strong> ${details.overview}</p>
        </div>

        <!-- Elenco -->
        <div style="background-color: rgba(20, 20, 20, 0.85); border-radius: 10px; padding: 10px; overflow-x: auto; margin-top: 10px;">
            <strong style="color: #f0f0f0;">Elenco:</strong>
            <div style="display: flex; align-items: center; font-size: 12px;">
                ${credits.cast.slice(0, 10).map(actor => `
                    <div style="margin-right: 10px; text-align: center;">
                        <img src="${baseImgUrl}${actor.profile_path}" alt="${actor.name}" style="width: 80px; height: 80px; border-radius: 15%; object-fit: cover;">
                        <p style="color: #f0f0f0; font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${actor.name.split(' ').slice(0, 2).join(' ')}
                        </p>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
        if (isSeries) {
    displaySeasons(details.id); // Chama a função para exibir as temporadas
}
        prepareButtons(details, isSeries);
    });

    modal.style.display = "flex";
    // Rola a .modal-content para o topo assim que o modal for aberto
    modalCont.scrollTop = 0;
    
    const closeButton = modal.querySelector('.close-button');
    closeButton.onclick = () => { modal.style.display = "none"; };

    // Aqui, implementamos o comportamento do botão "Voltar"
    const backButtonListener = (e) => {
        if (modal.style.display === "flex") {
            e.preventDefault(); // Impede o comportamento padrão de voltar
            modal.style.display = "none"; // Fecha o modal
        } else {
            // Se o modal não estiver aberto, o comportamento normal de voltar é executado
            document.removeEventListener("backbutton", backButtonListener); // Remove o listener quando o modal for fechado
        }
    };

    document.addEventListener("backbutton", backButtonListener, false);

}

function displaySimilarMovies(movieId, isSeries, backdropPath) {
    const baseApiUrl = `https://api.themoviedb.org/3/${isSeries ? 'tv' : 'movie'}/${movieId}/recommendations`;
    const apiUrl = `${baseApiUrl}?api_key=${apiKey}&language=pt-BR`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const recommendations = data.results.filter(movie => movie.poster_path).slice(0, 10);
            if (!recommendations.length) return;

            const modalBody = document.querySelector('.modal-similar');
            let recommendationsSection = document.querySelector('.recommendations-section');
            
            // Remove seção anterior se existir
            if (recommendationsSection) recommendationsSection.remove();

            // Cria container principal
            recommendationsSection = document.createElement('div');
            recommendationsSection.className = 'recommendations-section';
            recommendationsSection.style.cssText = `
                background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), 
                            url('https://image.tmdb.org/t/p/original${backdropPath}');
                background-size: cover;
                padding: 15px;
                border-radius: 12px;
                margin: 15px 0;
            `;

            // Título da seção
            const title = document.createElement('h3');
            title.innerHTML = `<i class="fas fa-film" style="color: #4B0082;"></i> Recomendações`;
            title.style.cssText = 'color: white; text-align: center; margin-bottom: 15px;';
            recommendationsSection.appendChild(title);

            // Container dos cards
            const carousel = document.createElement('div');
            carousel.className = 'recommendations-carousel';
            carousel.style.cssText = 'display: flex; gap: 15px; overflow-x: auto; padding: 10px 0;';

            // Adiciona cards usando a função padronizada
            recommendations.forEach(movie => {
                const card = createContentCard(movie, isSeries);
                card.style.width = '150px'; // Ajuste para proporção
                carousel.appendChild(card);
            });

            recommendationsSection.appendChild(carousel);
            modalBody.appendChild(recommendationsSection);
        })
        .catch(error => console.error('Erro ao carregar recomendações:', error));
}
  function changeView(viewId) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.style.display = 'none');

    const activeView = document.getElementById(viewId + '-view');
    if (activeView) {
        activeView.style.display = 'block';

        // Limpa o intervalo de destaque de séries sempre que muda de visualização
        clearInterval(seriesHighlightInterval);

        if (viewId === 'channels') {
            loadGenres();
        } else if (viewId === 'series') {
            loadHighlightSeries();
            loadRecommendedSeries();
            fetchAnimeSeries();
            fetchSeriesByGenre();
            seriesHighlightInterval = setInterval(nextSeriesHighlight, 5000); // Reinicia a rotação automática
            
            cordova.plugins.AppReview.requestReview();
            // request dialog and provide fallback
            cordova.plugins.AppReview.requestReview().catch(function() {
            return cordova.plugins.AppReview.openStoreScreen();
        });
        }
        else if(viewId === 'save'){
            displaySavedItems(); // Atualiza os cards
        }
    }

    // Atualize os botões da barra de navegação
    const navButtons = document.querySelectorAll('.navbar-bottom button');
    navButtons.forEach(button => {
        button.classList.remove('active-button');
        if (button.getAttribute('onclick') === `changeView('${viewId}')`) {
            button.classList.add('active-button');
        }
    });
}

// Adicione o evento de clique no botão de Canais de TV
document.querySelector('[onclick="changeView(\'channels\')"]').addEventListener('click', () => {
    changeView('channels');
});
  function fetchSeriesByGenre() {
    fetchContentByGenre(18, '#drama-series', true); // Drama
    fetchContentByGenre(35, '#comedy-series', true); // Comédia
    fetchContentByGenre(10759, '#action-series', true); // Ação e Aventura
    fetchContentByGenre(10765, '#sci-fi-series', true); // Ficção Científica e Fantasia
    fetchContentByGenre(80, '#crime-series', true); // Crime
    fetchContentByGenre(9648, '#mystery-series', true); // Mistério
    // Continue adicionando conforme os gêneros desejados
}
 async function loadRecommendedSeries() {
    const url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=pt-BR&sort_by=vote_count.desc&page=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const container = document.querySelector('#recommended-series .carousel');
        container.innerHTML = '';  // Limpa o carrossel antes de adicionar novos conteúdos

        data.results.forEach(series => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.style.backgroundImage = `url(${baseImgUrl}${series.poster_path})`;
            card.addEventListener('click', () => openModal(series, true));
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to fetch recommended series:', error);
    }
}
  async function loadHighlightSeries() {
        const url = `https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}&language=pt-BR`;  try {
        const response = await fetch(url);
        const data = await response.json();
        const carousel = document.getElementById('series-highlight-carousel');
        carousel.innerHTML = ''; // Limpar o carrossel antes de adicionar novos itens

        // Limita os resultados aos primeiros 7 destaques
        const limitedData = data.results.slice(0, 7);
        limitedData.forEach(series => {
            const card = document.createElement('div');
            card.className = 'highlight-card';
            card.style.backgroundImage = `url(${baseImgUrlCard}${series.backdrop_path})`;
            const title = document.createElement('div');
            title.className = 'highlight-title';
            title.textContent = series.name; // Ou series.title, dependendo da propriedade disponível
            card.appendChild(title);
            card.addEventListener('click', () => openModal(series, true));
            carousel.appendChild(card);
        });

        // Atualiza imediatamente após carregar os destaques
        updateSeriesHighlight();
    } catch (error) {
        console.error('Erro ao carregar destaques de séries:', error);
    }
}
  // Declaração de variáveis globais específicas para os destaques de séries
let currentSeriesHighlightIndex = 0;
let seriesHighlightInterval;

function updateSeriesHighlight() {
    const seriesHighlightContainer = document.getElementById('series-highlight-carousel');
    const highlights = seriesHighlightContainer.querySelectorAll('.highlight-card');

    // Cancela o intervalo anterior antes de iniciar um novo
    clearInterval(seriesHighlightInterval);

    // Esconde todos os cartões de destaque
    highlights.forEach(card => {
        card.style.display = 'none';
    });

    // Mostra o cartão de destaque atual
    if (highlights.length > 0) {
        highlights[currentSeriesHighlightIndex].style.display = 'block';
    }

    // Atualiza os indicadores para refletir o cartão visível
    updateIndicators(seriesHighlightContainer, highlights.length, currentSeriesHighlightIndex);

    // Reinicia o intervalo para a rotação automática dos destaques
    seriesHighlightInterval = setInterval(nextSeriesHighlight, 5000);  // Ajuste o tempo conforme necessário
}

function updateIndicators(container, total, activeIndex) {
    let indicatorContainer = container.querySelector('.indicator-container');
    if (!indicatorContainer) {
        indicatorContainer = document.createElement('div');
        indicatorContainer.className = 'indicator-container';
        container.appendChild(indicatorContainer);
    } else {
        indicatorContainer.innerHTML = '';
    }

    for (let i = 0; i < total; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'indicator' + (i === activeIndex ? ' active' : '');
        indicatorContainer.appendChild(indicator);
    }
}

function nextSeriesHighlight() {
    const seriesHighlightContainer = document.getElementById('series-highlight-carousel');
    const highlights = seriesHighlightContainer.querySelectorAll('.highlight-card');
    currentSeriesHighlightIndex = (currentSeriesHighlightIndex + 1) % highlights.length;
    updateSeriesHighlight();
}

function prevSeriesHighlight() {
    const seriesHighlightContainer = document.getElementById('series-highlight-carousel');
    const highlights = seriesHighlightContainer.querySelectorAll('.highlight-card');
    currentSeriesHighlightIndex = (currentSeriesHighlightIndex - 1 + highlights.length) % highlights.length;
    updateSeriesHighlight();
}

  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input-search');
    const searchButton = document.getElementById('search-button-search');

    // Função para executar a busca quando pressionado o ou Enter
    function executeSearch() {
        const query = searchInput.value.trim();
        if (query) {
            searchMoviesAndSeries(query);
            saveSearchQuery(query);
        }
    }

    searchButton.addEventListener('click', function() {
        executeSearch();
    });

    // Adiciona um ouvinte para o evento de tecla pressionada no campo de entrada
    searchInput.addEventListener('keyup', function(event) {
        // Verifica se a tecla pressionada foi o Enter
        if (event.key === "Enter") {
            executeSearch();
            searchInput.blur(); // Retira o foco do input após a busca
        }
    });

    // Adiciona o evento de foco para mostrar o histórico de pesquisa
    searchInput.addEventListener('focus', function() {
        showSearchHistory();
    });

    function saveSearchQuery(query) {
        let searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
        if (!searches.includes(query)) {
            searches.unshift(query); // Adiciona ao início do array
            searches = searches.slice(0, 7); // Mantém apenas os últimos 10 registros
            localStorage.setItem('searchHistory', JSON.stringify(searches));
        }
    }

    function showSearchHistory() {
    let searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const historyContainer = document.createElement('div');
    historyContainer.id = 'search-history';
    historyContainer.style.position = 'absolute';
    historyContainer.style.backgroundColor = 'black'; // Mudança para fundo preto
    historyContainer.style.color = 'white'; // Mudança para texto branco
    historyContainer.style.padding = '10px';
    historyContainer.style.width = searchInput.offsetWidth + 'px';
    historyContainer.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    historyContainer.style.borderRadius = '5px';
    historyContainer.style.zIndex = '1000';

    searches.forEach(function(item, index) {
        const option = document.createElement('div');
        option.innerHTML = `<i class="fas fa-history" style="margin-right: 8px; color: #ccc;"></i>${item}`;
        option.style.padding = '8px 12px';
        option.style.cursor = 'pointer';
        option.style.borderBottom = index < searches.length - 1 ? '1px solid #333' : 'none'; // Mudança para borda mais escura
        option.style.borderRadius = '5px';
        option.style.display = 'flex';
        option.style.alignItems = 'center';
        option.addEventListener('click', function() {
            searchInput.value = item;
            historyContainer.remove();
        });
        historyContainer.appendChild(option);
    });

    searchInput.parentNode.insertBefore(historyContainer, searchInput.nextSibling);
}

    searchInput.addEventListener('blur', function() {
        // Remove o histórico de pesquisa quando o input perder o foco
        // mas aguarda um pouco para permitir o clique no item
        setTimeout(() => {
            const historyContainer = document.getElementById('search-history');
            if (historyContainer) {
                historyContainer.remove();
            }
        }, 300);
    });
});
  
  function fetchAnimeSeries() {
    const animeUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=16&sort_by=vote_count.desc&vote_count.gte=100&with_original_language=ja&language=pt-BR`;
    fetch(animeUrl)
        .then(response => response.json())
        .then(data => displayAnimeSeries(data.results))
        .catch(error => console.error('Erro ao buscar animes:', error));
}

function displayAnimeSeries(animeSeries) {
    const container = document.getElementById('anime-series').querySelector('.carousel');
    animeSeries.forEach(anime => {
        const card = createContentCard(anime, true);
        container.appendChild(card);
    });
}
  let currentType = 'movie';

        function loadGenres() {
            currentType = document.getElementById('mediaType').value;
            const url = `https://api.themoviedb.org/3/genre/${currentType}/list?api_key=${apiKey}&language=pt-BR`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    displayGenres(data.genres);
                })
                .catch(error => console.log('Error fetching genres: ', error));
        }

        function displayGenres(genres) {
            const genreContainer = document.getElementById('genreContainer');
            genreContainer.innerHTML = '';
            genres.forEach(genre => {
                const div = document.createElement('div');
                div.className = 'genre';
                div.onclick = () => loadMedia(genre.id, genre.name, 1); 
                div.innerHTML = `<h4>${genre.name}</h4>`;
                fetchPopularMedia(genre.id, div);
                genreContainer.appendChild(div);
            });
        }

        const usedImages = new Set(); // Armazena as URLs das imagens já utilizadas

function fetchPopularMedia(genreId, genreDiv) {
    const url = `https://api.themoviedb.org/3/discover/${currentType}?api_key=${apiKey}&language=pt-BR&sort_by=popularity.desc&with_genres=${genreId}&vote_count.gte=500&page=1`;
  fetch(url)
        .then(response => response.json())
        .then(data => {
            let imageUrl;
            // Loop para encontrar uma imagem não usada
            for (let i = 0; i < data.results.length; i++) {
                imageUrl = `https://image.tmdb.org/t/p/w500${data.results[i].backdrop_path || data.results[i].poster_path}`;
                if (!usedImages.has(imageUrl)) {
                    usedImages.add(imageUrl);
                    break;
                }
            }
            
            if (imageUrl) {
                genreDiv.style.backgroundImage = `url(${imageUrl})`;
                genreDiv.style.backgroundSize = 'cover';
                genreDiv.style.backgroundPosition = 'center';
            }
        })
        .catch(error => console.log('Error fetching popular media: ', error));
}
// Função ajustada para carregar 120 resultados de um gênero
async function loadMedia(genreId, genreName, page) {
    const totalResults = 100;
    let results = [];

    for (let p = 1; results.length < totalResults; p++) {
        const url = `https://api.themoviedb.org/3/discover/${currentType}?api_key=${apiKey}&language=pt-BR&with_genres=${genreId}&page=${p}&vote_count.gte=50&sort_by=vote_count.desc`;
        const response = await fetch(url);
        const data = await response.json();
        // Filtra os resultados para incluir apenas aqueles com 'poster_path' não nulo
        const validResults = data.results.filter(item => item.poster_path !== null && item.poster_path !== "");
        results = results.concat(validResults.slice(0, totalResults - results.length));
        if (p >= data.total_pages) break;
    }

    openGenreModal(genreName, results);  // Passando o nome do gênero para a função que abre o modal
}
function displayMediaInModal(medias) {
    const modalBody = document.querySelector('#modal .modal-body');
    modalBody.innerHTML = '<div class="search-results-grid"></div>'; // Prepara o container da grid
    const grid = modalBody.querySelector('.search-results-grid');

    medias.forEach(media => {
        const mediaCard = createContentCard(media, currentType !== 'movie');
        grid.appendChild(mediaCard);
    });

    document.getElementById('modal').style.display = 'flex'; // Exibe o modal
}
  function openGenreModal(genreName, medias) {
    const modal = document.getElementById('genreModal');
    const genreNameElement = document.getElementById('genreName'); // Assegure-se de que este elemento exista no HTML
    genreNameElement.textContent = genreName; // Atualizando o nome do gênero no modal
    modal.style.display = "flex";

    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = ''; // Limpa o conteúdo anterior
    medias.forEach(media => {
        const mediaCard = createContentCard(media, currentType !== 'movie');
        modalBody.appendChild(mediaCard);
    });

    // ANUNCIO INTERTITIAL DOS GENEROS
    var rewardIntertitial = "ca-app-pub-6784032070981923/2222479864";
        adMob.interstitial(rewardIntertitial)
        .then(function() {
        console.log("Carregado interstitial ads");
            return adMob.showInterstitial();
        })
        .then(function() {
                console.log("Exibido interstitial ads");
        })
        .catch(function(err) {
                console.log("Não foi possível carregar interstitial ads: " + JSON.stringify(err));
        });
}

function closeGenreModal() {
    const modal = document.getElementById('genreModal');
    modal.style.display = "none";
}
document.addEventListener('DOMContentLoaded', function() {
    const splashTitle = document.getElementById('splash-title');
    const text = 'uanzinAPP';
    let delay = 0;

    text.split('').forEach((char, index) => {
        let letter = document.createElement('span');
        letter.textContent = char;
        letter.style.animationDelay = `${delay}s`;
        letter.className = 'splash-letter';
        splashTitle.appendChild(letter);
        delay += 0.1;
    });

    setTimeout(function() {
        document.getElementById('splash-screen').style.opacity = '0';
        setTimeout(function() {
            document.getElementById('splash-screen').style.display = 'none';

            // Carregar o anúncio de banner logo após a tela de splash desaparecer
            var admob_ids = "ca-app-pub-6784032070981923/8093753642"; // ID do banner
            adMob.banner(admob_ids)
                .then(function() {
                    console.log("Banner ad carregado");
                })
                .catch(function(err) {
                    console.log("Não foi possível carregar o banner ad: " + JSON.stringify(err));
                });

        }, 1000); // Espera a transição de opacidade terminar
    }, 5000); // Mantém a tela de splash por 5 segundos no total
});

// 👉 Função para fechar o player embed
function hideContentModal() {
    const contentModal = document.getElementById('contentModal');
    const contentFrame = document.getElementById('contentFrame');

    if (contentModal) {
        contentModal.style.display = 'none';
    }
    if (contentFrame) {
        contentFrame.src = ''; // Limpa o iframe pra parar o vídeo
    }
}

// 👉 Fecha o modal clicando fora do player
document.getElementById('contentModal').addEventListener('click', function(e) {
    if (e.target === this) {
        hideContentModal();
    }
});

// 👉 Fecha o modal apertando ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const contentModal = document.getElementById('contentModal');
        if (contentModal.style.display === 'block' || contentModal.style.display === '') {
            hideContentModal();
        }
    }
});

// Adicione esta função para buscar os Top 10
async function fetchTop10Movies() {
    const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&language=pt-BR&region=BR`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const top10Movies = data.results.slice(0, 10);
        displayTop10Movies(top10Movies);
    } catch (error) {
        console.error('Erro ao buscar top 10 filmes:', error);
    }
}

// Função para exibir os filmes do Top 10
function displayTop10Movies(movies) {
    const container = document.getElementById('top10-container');
    container.innerHTML = '';

    movies.forEach((movie, index) => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'top10-card';

        // Elemento de ranking (número grande)
        const rankElement = document.createElement('div');
        rankElement.className = 'top10-rank';
        rankElement.textContent = index + 1;
        cardContainer.appendChild(rankElement);

        // Elemento de imagem
        const imgElement = document.createElement('img');
        imgElement.className = 'movie-card';
        imgElement.loading = 'lazy';
        imgElement.src = movie.poster_path ? `${baseImgUrl}${movie.poster_path}` : 'img/fallback.jpg';
        imgElement.alt = movie.title;
        imgElement.style.border = '3px solid #4B0082';
        imgElement.style.boxShadow = '0 8px 16px rgba(0,0,0,0.5)';
        cardContainer.appendChild(imgElement);

        // Fallback para imagens inválidas
        imgElement.onerror = function() {
            this.src = 'img/fallback.jpg';
            this.style.objectFit = 'contain';
        };

        // Evento de clique
        cardContainer.addEventListener('click', () => openModal(movie, false));

        container.appendChild(cardContainer);
    });
}

// Atualize o DOMContentLoaded para incluir a nova função
document.addEventListener("DOMContentLoaded", () => {
    fetchHighlight();
    fetchGenres();
    fetchTop10Movies(); // Adicione esta linha
    displayRecentlyWatched();
});

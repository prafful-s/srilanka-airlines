export function updateButtons(activeSlide) {
  const block = activeSlide.closest('.block');
  const buttons = block.closest('.cf-carousel-wrapper').querySelector('.cf-carousel-buttons');

  const nthSlide = activeSlide.offsetLeft / activeSlide.parentNode.clientWidth;
  const button = block.parentElement.querySelector(`.cf-carousel-buttons > button:nth-child(${nthSlide + 1})`);
  [...buttons.children].forEach((r) => r.classList.remove('selected'));
  button.classList.add('selected');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function filterItemsByLocation(items, locations) {
  if (!Array.isArray(locations)) locations = [locations];
  return items.filter(item =>
    Array.isArray(item.locationTag) &&
    item.locationTag.some(tag => {
      const parts = tag.split(':');
      const tagLocation = parts[1]?.trim().toLowerCase();
      return locations.some(loc => tagLocation === loc.toLowerCase());
    })
  );
}

function sortItemsByLastModified(items) {
  return items.sort((a, b) => {
    const getLastModified = (item) => {
      const metaArr = item._metadata?.calendarMetadata || [];
      const lastMod = metaArr.find(m => m.name === 'cq:lastModified');
      return lastMod ? Date.parse(lastMod.value) : 0;
    };
    return getLastModified(b) - getLastModified(a);
  });
}

async function loadContentFragments(cfQueryPath) {
  const cfFolder = await fetch(`/graphql/execute.json/srilanka-airlines/${cfQueryPath}`);
  const cfFolderData = await cfFolder.json();
  const cfItems = Object.values(cfFolderData?.data)?.[0]?.items;
  return cfItems;
}

async function userLocation() {
  await delay(200);
  return {
    location: ['Delhi', 'Bangalore', 'Chennai']
  };
}

export default function decorate(block) {
  // Pagination dots container
  const pagination = document.createElement('div');
  pagination.classList.add('cf-carousel-pagination');

  // Get configuration from block attributes
  const cfFolderPath = block?.querySelector('[data-aue-prop="reference"]')?.textContent?.trim() || '';
  const slidesToShowEl = block?.querySelector('[data-aue-prop="slidesToShow"]');
  const slidesToShow = slidesToShowEl ? parseInt(slidesToShowEl?.textContent.trim(), 10) : 3;
  const layout = block?.querySelector('[data-aue-prop="layout"]')?.textContent.trim() || 'verticle';
  const arrowNavigation = block?.querySelector('[data-aue-prop="arrowNavigation"]')?.textContent.trim()?.toLowerCase() === 'true' || true;
  const autoRotate = block?.querySelector('[data-aue-prop="autoRotate"]')?.textContent.trim()?.toLowerCase() === 'true' || true;
  const customStyle = block?.querySelector('[data-aue-prop="customStyle"]')?.textContent.trim() || '';

  if (!cfFolderPath) return;

  // Responsive slidesToShow
  function getResponsiveSlidesToShow() {
    const width = window.innerWidth;
    if (width >= 1024) return slidesToShow;
    if (width >= 600) return 2;
    return 1;
  }

  let currentSlidesToShow = getResponsiveSlidesToShow();
  let sortedItems = [];

  // Card-based slide structure
  function createSlide(item, slidesToShowValue) {
    const card = document.createElement('div');
    card.classList.add('cf-carousel-card', layout);
    // card.style.width = `${100 / slidesToShowValue}%`;
    card.innerHTML = `
      <div class="cf-carousel-card-image">
        <img src="${item.image._path}" alt="${item.title}" loading="eager" />
      </div>
      <div class="cf-carousel-card-body">
        <h3>${item.title}</h3>
        <p>${item.description?.plaintext || item.description || ''}</p>
        ${item.button ? `<button class="cf-carousel-card-btn">${item.button}</button>` : ''}
      </div>
    `;
    return card;
  }

  // Pagination dots
  function updatePagination(activePage) {
    pagination.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('span');
      dot.className = 'cf-carousel-pagination-dot' + (i === activePage ? ' active' : '');
      dot.addEventListener('click', () => {
        scrollToPage(i);
      });
      pagination.appendChild(dot);
    }
  }

  // Create left and right arrow buttons
  const leftArrow = document.createElement('button');
  leftArrow.classList.add('cf-carousel-arrow', 'cf-carousel-arrow-left');
  leftArrow.innerHTML = '&#8592;'; // Left arrow symbol
  leftArrow.style.display = 'none';

  const rightArrow = document.createElement('button');
  rightArrow.classList.add('cf-carousel-arrow', 'cf-carousel-arrow-right');
  rightArrow.innerHTML = '&#8594;'; // Right arrow symbol
  rightArrow.style.display = 'none';

  let currentPage = 0;
  let totalPages = 1;

  function scrollToPage(page) {
    block.scrollTo({
      left: block.clientWidth * page,
      behavior: 'smooth'
    });
    currentPage = page;
    updateArrowVisibility(page);
    updatePagination(page);
  }

  function updateArrowVisibility(page) {
    if (totalPages <= 1) {
      leftArrow.style.display = 'none';
      rightArrow.style.display = 'none';
      return;
    }
    leftArrow.style.display = page > 0 ? '' : 'none';
    rightArrow.style.display = page < totalPages - 1 ? '' : 'none';
  }

  leftArrow.addEventListener('click', () => {
    if (currentPage > 0) {
      scrollToPage(currentPage - 1);
    }
  });

  rightArrow.addEventListener('click', () => {
    if (currentPage < totalPages - 1) {
      scrollToPage(currentPage + 1);
    }
  });

  function setCarouselWidth() {
    const cardMaxWidth = 320;
    const slidesToShowNow = getResponsiveSlidesToShow();
    block.style.maxWidth = `${cardMaxWidth * slidesToShowNow + (slidesToShowNow - 1) * 20 + 10}px`;
  }

  function renderCarousel() {
    block.replaceChildren();
    currentSlidesToShow = getResponsiveSlidesToShow();
    // Render slides
    sortedItems.forEach(item => {
      block.append(createSlide(item, currentSlidesToShow));
    });
    // No navigation buttons, only pagination dots
    const totalSlides = sortedItems.length;
    totalPages = Math.ceil(totalSlides / currentSlidesToShow);
    updatePagination(0);
    setCarouselWidth();
  }

  (async () => {
    try {
      // Fetch and process data
      const cfItems = await loadContentFragments(cfFolderPath);
      const { location } = await userLocation();
      const filteredItems = filterItemsByLocation(cfItems, location);
      sortedItems = sortItemsByLastModified(filteredItems);

      renderCarousel();

      // Insert navigation arrows
      if (arrowNavigation) {
        block.parentElement.append(leftArrow);
        block.parentElement.append(rightArrow);
      }
      // Insert pagination only
      block.parentElement.append(pagination);
      if (customStyle) block.classList.add(customStyle);
      if (arrowNavigation) updateArrowVisibility(0);
      updatePagination(0);

      block.addEventListener('scroll', () => {
        const page = Math.round(block.scrollLeft / block.clientWidth);
        currentPage = page;
        if (arrowNavigation) updateArrowVisibility(page);
        updatePagination(page);
      }, { passive: true });

      // Responsive: re-render on resize
      window.addEventListener('resize', () => {
        const newSlidesToShow = getResponsiveSlidesToShow();
        if (newSlidesToShow !== currentSlidesToShow) {
          renderCarousel();
          if (arrowNavigation) updateArrowVisibility(0);
          updatePagination(0);
        } else {
          setCarouselWidth();
        }
      });
    } catch (error) {
      console.error('Error loading content fragments or user location:', error);
    }
  })();
}

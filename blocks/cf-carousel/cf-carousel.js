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
  const { hostname } = window.location;
  // Use relative path for AEM author or publish domains
  const isAemCloud = hostname.includes('author-p140426-e1433687.adobeaemcloud.com') ||
                     hostname.includes('publish-p140426-e1433687.adobeaemcloud.com');
  // Use publish domain for preview/live... not strict for now.
  const isPreviewOrLive = hostname.includes('main--srilanka-airlines--prafful-s.aem.page') ||
                          hostname.includes('main--srilanka-airlines--prafful-s.aem.live');
  const apiBase = isAemCloud
    ? ''
    : 'https://publish-p140426-e1433687.adobeaemcloud.com';
  const apiUrl = `${apiBase}/graphql/execute.json/srilanka-airlines/${cfQueryPath}`;
  const cfFolder = await fetch(apiUrl);
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

// Helper to get attribute value by prop name, supporting both author and publish environments
function getBlockPropValue(block, propName, order) {
  const attrDiv = block.querySelector(`[data-aue-prop="${propName}"]`);
  if (attrDiv) {
    return attrDiv.textContent?.trim() || '';
  } else if (block.children[order]) {
    return block.children[order].textContent?.trim() || '';
  }
  return '';
}

export default function decorate(block) {
  // Pagination dots container
  const pagination = document.createElement('div');
  pagination.classList.add('cf-carousel-pagination');

  // Get configuration from block attributes or sequential divs.
  const cfFolderPath = getBlockPropValue(block, 'reference', 0);
  const slidesToShowVal = getBlockPropValue(block, 'slidesToShow', 1);
  const layout = getBlockPropValue(block, 'layout', 2) || 'verticle';
  const arrowNavigationVal = getBlockPropValue(block, 'arrowNavigation', 3);
  const autoRotateVal = getBlockPropValue(block, 'autoRotate', 4);
  const customStyle = getBlockPropValue(block, 'customStyle', 5);

  // Default values
  const slidesToShow = slidesToShowVal ? parseInt(slidesToShowVal, 10) : 3;
  const arrowNavigation = arrowNavigationVal?.toLowerCase() === 'true' || true;
  const autoRotate = autoRotateVal?.toLowerCase() === 'true' || true;

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
        <img src="${item.image._publishUrl}" alt="${item.title}" loading="eager" />
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
  leftArrow.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.5 19L9.5 12L15.5 5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  leftArrow.style.display = 'none';

  const rightArrow = document.createElement('button');
  rightArrow.classList.add('cf-carousel-arrow', 'cf-carousel-arrow-right');
  rightArrow.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.5 5L14.5 12L8.5 19" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  rightArrow.style.display = 'none';

  // Create arrow button container
  const arrowContainer = document.createElement('div');
  arrowContainer.classList.add('cf-carousel-arrows');
  arrowContainer.append(leftArrow, rightArrow);

  // Set arrow container width for desktop
  if (window.innerWidth >= 1024) {
    const slidesToShowNow = getResponsiveSlidesToShow();
    arrowContainer.style.width = `${320 * slidesToShowNow + (slidesToShowNow - 1) * 20 + 10}px`;
  }

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
    // block.parentElement.querySelector('.cf-carousel-arrows').style.width = `${cardMaxWidth * slidesToShowNow + (slidesToShowNow - 1) * 20 + 10}px`;
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
        block.parentElement.append(arrowContainer);
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

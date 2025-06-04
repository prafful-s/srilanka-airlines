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
  // Create navigation buttons container
  const buttons = document.createElement('div');
  buttons.classList.add('cf-carousel-buttons');

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

  // Update slide width helper
  function createSlide(item, slidesToShowValue) {
    const slide = document.createElement('div');
    slide.classList.add('slide', layout);
    slide.style.width = `${100 / slidesToShowValue}%`;
    slide.innerHTML = `
      <div class="cf-carousel-image"><picture><img src="${item.image._path}" loading="eager"></picture></div>
      <div class="cf-carousel-text">
        <h3>${item.title}</h3>
        <p>${item.description?.plaintext || item.description || ''}</p>
        ${item.button ? `<button class="cf-carousel-item-button">${item.button}</button>` : ''}
      </div>
    `;
    return slide;
  }

  function createNavButton(page, totalSlides, slidesToShow, block, buttons) {
    const button = document.createElement('button');
    button.title = `Go to slides ${page * slidesToShow + 1} - ${Math.min((page + 1) * slidesToShow, totalSlides)}`;
    if (page === 0) button.classList.add('selected');
    button.addEventListener('click', () => {
      block.scrollTo({
        left: block.clientWidth * page,
        behavior: 'smooth'
      });
      [...buttons.children].forEach((r) => r.classList.remove('selected'));
      button.classList.add('selected');
      updateArrowVisibility(page);
    });
    return button;
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
    // Update nav button selection
    [...buttons.children].forEach((r, idx) => {
      r.classList.toggle('selected', idx === page);
    });
    updateArrowVisibility(page);
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

  function renderCarousel() {
    block.replaceChildren();
    currentSlidesToShow = getResponsiveSlidesToShow();
    // Render slides
    sortedItems.forEach(item => {
      block.append(createSlide(item, currentSlidesToShow));
    });
    // Render navigation buttons
    buttons.innerHTML = '';
    const totalSlides = sortedItems.length;
    totalPages = Math.ceil(totalSlides / currentSlidesToShow);
    for (let page = 0; page < totalPages; page++) {
      buttons.append(createNavButton(page, totalSlides, currentSlidesToShow, block, buttons));
    }
  }

  (async () => {
    try {
      // Fetch and process data
      const cfItems = await loadContentFragments(cfFolderPath);
      const { location } = await userLocation();
      const filteredItems = filterItemsByLocation(cfItems, location);
      sortedItems = sortItemsByLastModified(filteredItems);

      renderCarousel();

      // Insert navigation buttons and arrows
      if (block.nextElementSibling) block.nextElementSibling.replaceWith(buttons);
      else block.parentElement.append(buttons);
      if (arrowNavigation) {
        block.parentElement.append(leftArrow);
        block.parentElement.append(rightArrow);
      }
      if (customStyle) block.classList.add(customStyle);
      if (arrowNavigation) updateArrowVisibility(0);

      block.addEventListener('scroll', () => {
        const page = Math.round(block.scrollLeft / block.clientWidth);
        currentPage = page;
        [...buttons.children].forEach((r, idx) => {
          r.classList.toggle('selected', idx === page);
        });
        if (arrowNavigation) updateArrowVisibility(page);
      }, { passive: true });

      // Responsive: re-render on resize
      window.addEventListener('resize', () => {
        const newSlidesToShow = getResponsiveSlidesToShow();
        if (newSlidesToShow !== currentSlidesToShow) {
          renderCarousel();
          if (arrowNavigation) updateArrowVisibility(0);
        }
      });
    } catch (error) {
      console.error('Error loading content fragments or user location:', error);
    }
  })();
}

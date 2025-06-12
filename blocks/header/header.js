import { decorateIcons, getMetadata } from '../../scripts/lib-franklin.js';
import { getSiteRoot } from '../../scripts/scripts.js';
/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : (window.wknd.demoConfig.demoBase || '/nav');

  const resp = await fetch(`${getSiteRoot(5)}${navPath}.plain.html`, window.location.pathname.endsWith('/nav') ? { cache: 'reload' } : {});
  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.innerHTML = html;
    decorateIcons(nav);

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((e, j) => {
      const section = nav.children[j];
      if (section) section.classList.add(`nav-${e}`);
    });

    const navSections = [...nav.children][1];
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          collapseAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
      });
    }

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
    hamburger.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      document.body.style.overflowY = expanded ? '' : 'hidden';
      nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
    const topBar = document.createElement('div');
    topBar.classList.add('header-topbar');
    block.prepend(topBar);

    // --- Sign In/Out logic ---
    const users = [
      { username: 'delhiuser', password: '12345', location: 'Delhi' },
      { username: 'chennaiuser', password: '12345', location: 'Chennai' },
      { username: 'bangaloreuser', password: '12345', location: 'Bangalore' },
    ];
    function getCurrentUser() {
      try {
        return JSON.parse(localStorage.getItem('mockUserSession'));
      } catch {
        return null;
      }
    }
    function setCurrentUser(user) {
      if (user) {
        localStorage.setItem('mockUserSession', JSON.stringify(user));
      } else {
        localStorage.removeItem('mockUserSession');
      }
    }
    function updateSignInText() {
      const signInBtn = topBar.querySelector('.header-signin');
      if (!signInBtn) return;
      const user = getCurrentUser();
      signInBtn.textContent = user ? 'Sign Out' : 'Sign In';
    }
    function showModal() {
      let modal = document.querySelector('.mock-login-modal');
      if (modal) modal.remove();
      modal = document.createElement('div');
      modal.className = 'mock-login-modal';
      modal.innerHTML = `
        <div class="mock-login-modal-backdrop"></div>
        <div class="mock-login-modal-content">
          <h2>Sign In</h2>
          <form>
            <label>Username<br><input type="text" name="username" autocomplete="username" required></label>
            <label>Password<br><input type="password" name="password" autocomplete="current-password" required></label>
            <button class="mock-login-submit" type="submit">Sign In</button>
            <button type="button" class="mock-login-cancel">Cancel</button>     
          </form>
          <div class="mock-login-error">Invalid credentials</div>
        </div>
      `;
      document.body.appendChild(modal);
      document.body.style.overflowY = 'hidden';
      function closeModal() {
        modal.remove();
        document.body.style.overflowY = '';
        document.removeEventListener('keydown', escListener);
      }
      modal.querySelector('.mock-login-modal-backdrop').onclick = closeModal;
      modal.querySelector('.mock-login-cancel').onclick = closeModal;
      modal.querySelector('form').onsubmit = (e) => {
        e.preventDefault();
        const username = modal.querySelector('input[name="username"]').value.trim();
        const password = modal.querySelector('input[name="password"]').value;
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          setCurrentUser(user);
          updateSignInText();
          closeModal();
        } else {
          modal.querySelector('.mock-login-error').style.display = 'block';
        }
      };
      // Escape key closes modal
      function escListener(e) {
        if (e.key === 'Escape') {
          closeModal();
        }
      }
      document.addEventListener('keydown', escListener);
      // Remove listener if modal is closed by other means
      modal.addEventListener('remove', () => {
        document.body.style.overflowY = '';
        document.removeEventListener('keydown', escListener);
      });
    }
    function handleSignInClick() {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(null);
        updateSignInText();
      } else {
        showModal();
      }
    }
    // --- End Sign In/Out logic ---

    topBar.innerHTML = '<div class="header-signin" style="cursor:pointer;">Sign In</div><div class="header-markets"><span class="icon icon-flag-us"></span>EN-US<span class="header-chevron-down"></span></div>';
    topBar.querySelector('.header-signin').onclick = handleSignInClick;
    updateSignInText();

    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    decorateIcons(block);
    block.append(nav);
  }
}

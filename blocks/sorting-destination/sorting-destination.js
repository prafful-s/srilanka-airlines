export default function decorate(block) {
  block.innerHTML = `
    <div class="sorting-destination">
      <div class="sorting-destination-filters">
        <select class="sorting-destination-select" aria-label="Select route">
          <option value="">Select route</option>
          <!-- Add more options as needed -->
        </select>
        <select class="sorting-destination-select" aria-label="Departure Date">
          <option value="">Departure Date</option>
          <!-- Add more options as needed -->
        </select>
        <select class="sorting-destination-select" aria-label="Budget">
          <option value="">Budget</option>
          <!-- Add more options as needed -->
        </select>
        <button class="sorting-destination-clear" type="button">Clear</button>
      </div>
      <div class="sorting-destination-sort">
        <span class="sorting-destination-sort-icon" aria-hidden="true">
          <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4h10M5 8h6m-3 4h0" stroke="#009cff" stroke-width="2" stroke-linecap="round"/></svg>
        </span>
        <button class="sorting-destination-sort-btn" type="button">
          <span class="sorting-destination-sort-label">Sort: <strong>Popular</strong></span>
          <svg class="sorting-destination-sort-caret" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5l3 3 3-3" stroke="#009cff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
  `;
}

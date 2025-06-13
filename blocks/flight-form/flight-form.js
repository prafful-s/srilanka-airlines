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

// Helper to get components by name, supporting both author and publish environments
function getBlockComponent(block, resourceName, order) {
    const nodeList = block.querySelectorAll(`[data-aue-model="${resourceName}"]`);
    if (nodeList.length > 0) {
      return nodeList;
    } else if (block.children[order]) {
      // Return all children from the given order index onward
      const arr = [];
      for (let i = order; i < block.children.length; i++) {
        arr.push(block.children[i]);
      }
      return arr;
    }
    return '';
}

export default async function decorate(block) {
    console.log("flight-form added");
    const classSelector = getBlockPropValue(block, 'classSelector', 0);
    const multiCityPosition = getBlockPropValue(block, 'multiCityPosition', 1);
    const buttonList = getBlockComponent(block, 'flight-tab', 2);
    const tabButtons = [];

    const multiCityLink = document.createElement('a');
    multiCityLink.href = '#';
    multiCityLink.className = 'multi-city-link';
    multiCityLink.textContent = 'Multi City';

    if (buttonList && buttonList.length) {
        buttonList.forEach((btnDiv, idx) => {
          // You can customize the label extraction as needed
          const label = btnDiv.textContent.trim();
          const button = document.createElement('div');
          button.className = 'flight-form-tab';
          button.textContent = btnDiv.textContent.trim();
          // Copy all attributes from btnDiv to button
          if (btnDiv?.attributes?.length > 0) {
            for (let attr of btnDiv.attributes) {
              if (attr.value !== undefined && attr.value !== null && attr.value !== '') {
                button.setAttribute(attr.name, attr.value);
              }
            }
          }
          tabButtons.push(button);
        });
      }
    block.innerHTML= `
    <div class="flight-booking-form">
        <div class="flight-form-tabs">
            ${tabButtons.map(btn => btn.outerHTML).join('')}
        </div>
        <form>
            <div class="form-row top-row">
            <div class="checkbox-group">
                <label><input type="checkbox" id="redeem"> Redeem</label>
                <label><input type="checkbox" id="voucher-redeem"> Voucher Redeem</label>
            </div>
            ${multiCityPosition !== 'bottom' ? multiCityLink.outerHTML : ''}
            </div>
            <div class="form-row">
            <div class="input-icon-group">
                <span class="icon icon-from"></span>
                <label for="from-select" class="visually-hidden">From</label>
                <select id="from-select" name="from">
                  <option value="SIN">Singapore</option>
                  <option value="SGN">Vietnam</option>
                  <option value="BKK" selected>Thailand</option>
                  <option value="KUL">Malaysia</option>
                  <option value="CGK">Indonesia</option>
                </select>
            </div>
            <div class="input-icon-group">
                <span class="icon icon-to"></span>
                <label for="to-select" class="visually-hidden">To</label>
                <select id="to-select" name="to">
                  <option value="SIN" selected>Singapore</option>
                  <option value="SGN">Vietnam</option>
                  <option value="BKK">Thailand</option>
                  <option value="KUL">Malaysia</option>
                  <option value="CGK">Indonesia</option>
                </select>
            </div>
            </div>
            <div class="form-row">
            <div class="input-icon-group">
                <span class="icon icon-calendar"></span>
                <div class="date-group">
                    <label>Departure<br><input type="date" id="departureDate"></label>
                </div>
                <div class="date-group">
                    <label>Return<br><input type="date" id="returnDate"></label>
                </div>
            </div>
            <div class="input-icon-group">
                <span class="icon icon-passenger"></span>
                <div class="date-group">
                    <label class="left-aligned">Select Passenger count & class <br>
                        <select id="passenger-class"><option>1 Passenger | Economy</option></select>
                    </label>
                </div>
            </div>
            </div>
            <div class="form-row bottom-row">
                <div class="input-group">
                    <div class="radio-group">
                        <label><input type="radio" name="tripType" checked> Round Trip</label>
                        <label><input type="radio" name="tripType"> One Way</label>
                    </div>
                    ${multiCityPosition === 'bottom' ? multiCityLink.outerHTML : ''}
                </div>
                <div class="input-group button-group">
                    <div class="radio-group">
                        <label><input type="checkbox" id="flexible-dates"> Flexible Dates</label>
                    </div>
                    <button type="submit" class="find-flights-button">Search</button>
                </div>
            </div>
        </form>
    </div>
    `;

    const fromSelect = block.querySelector("#from-select");
    const toSelect = block.querySelector("#to-select");

    // Update "To" options when "From" changes
    fromSelect.addEventListener("change", () => {
        const selectedFrom = fromSelect.value;

        for (let option of toSelect.options) {
            option.disabled = (option.value === selectedFrom);
        }
    });

    const searchBtn = block.querySelector('.find-flights-button');
    if (searchBtn) {
        searchBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const origin = block.querySelector("#from-select").value;
            console.log('Origin is ', origin);
            const destination = block.querySelector("#to-select").value;
            console.log('Destination is', destination);
            try {
                const url = `https://publish-p140426-e1433687.adobeaemcloud.com/content/flight-offer-price?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                console.log('AJAX Response:', data);
            } catch (error) {
                console.error('Error during AJAX call:', error);
            }
        });
    } else {
        console.warn('Search button not found');
    }
}

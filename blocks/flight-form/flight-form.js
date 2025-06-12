export default async function decorate(block) {
    console.log("flight-form added");
    block.innerHTML= `
    <div class="flight-booking-form">
        <div class="flight-form-tabs">
            <button class="flight-form-tab active">BOOK</button>
            <button class="flight-form-tab">MANAGE</button>
            <button class="flight-form-tab">CHECK-IN</button>
            <button class="flight-form-tab">FLIGHT + HOTEL</button>
        </div>
        <form>
            <div class="form-row top-row">
            <div class="checkbox-group">
                <label><input type="checkbox" id="redeem"> Redeem</label>
                <label><input type="checkbox" id="voucher-redeem"> Voucher Redeem</label>
            </div>
            <a href="#" class="multi-city-link">Multi City</a>
            </div>
            <div class="form-row">
            <div class="input-icon-group">
                <span class="icon icon-from"></span>
                <label for="from-select" class="visually-hidden">From</label>
                <select id="from-select" name="from">
                  <option>SIN</option>
                  <option>SGN</option>
                  <option>BKK</option>
                  <option>KUL</option>
                  <option>CGK</option>
                </select>
            </div>
            <div class="input-icon-group">
                <span class="icon icon-to"></span>
                <label for="to-select" class="visually-hidden">To</label>
                <select id="to-select" name="to">
                  <option>SIN</option>
                  <option>SGN</option>
                  <option>BKK</option>
                  <option>KUL</option>
                  <option>CGK</option>
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
}

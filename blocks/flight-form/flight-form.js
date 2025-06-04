export default async function decorate(block) {
    console.log("flight-form added");
    block.innerHTML= `
    <div class="flight-booking-form">
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
                <select id="from"><option>From</option></select>
            </div>
            <div class="input-icon-group">
                <span class="icon icon-to"></span>
                <select id="to"><option>To</option></select>
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
            <div class="radio-group">
                <label><input type="radio" name="tripType" checked> Round Trip</label>
                <label><input type="radio" name="tripType"> One Way</label>
                <label><input type="checkbox" id="flexible-dates"> Flexible Dates</label>
            </div>
            <button type="submit" class="find-flights-button">Search</button>
            </div>
        </form>
    </div>
    `;
}

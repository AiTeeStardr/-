document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');
    const unitsInput = document.getElementById('units');
    const resultCard = document.getElementById('resultCard');
    
    // Output elements
    const breakdownBody = document.getElementById('breakdownBody');
    const baseCostTotalEl = document.getElementById('baseCostTotal');
    const summaryBaseEl = document.getElementById('summaryBase');
    const summaryServiceEl = document.getElementById('summaryService');
    const summaryFtEl = document.getElementById('summaryFt');
    const summaryPreVatEl = document.getElementById('summaryPreVat');
    const summaryVatEl = document.getElementById('summaryVat');
    const totalAmountEl = document.getElementById('totalAmount');

    // Rates according to standard Thai PEA/MEA (Type 1.1 or 1.2 combined logic for > 150 units typical)
    // We will use the simplified Type 1.2 logic (Using more than 150 units logic is most common for calculation)
    // To make it detailed step-by-step, we use the 7-tier structure (Type 1.1) to show beautiful breakdown.
    
    const TIERS = [
        { name: "1 - 15", limit: 15, price: 2.3365 },
        { name: "16 - 25", limit: 10, price: 3.1381 },
        { name: "26 - 35", limit: 10, price: 3.2405 },
        { name: "36 - 100", limit: 65, price: 3.6237 },
        { name: "101 - 150", limit: 50, price: 3.7171 },
        { name: "151 - 400", limit: 250, price: 4.2218 },
        { name: "401 เป็นต้นไป", limit: Infinity, price: 4.4217 }
    ];

    const FT_RATE = 0.1623; // Current approx Ft rate (บาท/หน่วย)
    const SERVICE_CHARGE = 38.22; // Service charge (บาท)
    const VAT_RATE = 0.07; // 7%

    const formatMoney = (amount) => {
        return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    calculateBtn.addEventListener('click', () => {
        let units = parseFloat(unitsInput.value);
        
        if (isNaN(units) || units < 0) {
            alert('กรุณากรอกจำนวนหน่วยไฟฟ้าให้ถูกต้อง');
            return;
        }

        // Calculation State
        let remainingUnits = units;
        let totalBaseCost = 0;
        let breakdownHTML = '';

        // Calculate by tiers
        for (const tier of TIERS) {
            if (remainingUnits <= 0) break;

            const unitsInTier = Math.min(remainingUnits, tier.limit);
            const costForTier = unitsInTier * tier.price;
            
            totalBaseCost += costForTier;
            remainingUnits -= unitsInTier;

            breakdownHTML += `
                <tr>
                    <td>${tier.name}</td>
                    <td>${unitsInTier.toFixed(2)}</td>
                    <td>${tier.price.toFixed(4)}</td>
                    <td>${formatMoney(costForTier)}</td>
                </tr>
            `;
        }

        if (units === 0) {
            breakdownHTML = `<tr><td colspan="4" class="text-center">ไม่มีการใช้ไฟฟ้า</td></tr>`;
        }

        // Calculate other components
        const totalFt = units * FT_RATE;
        const preVat = totalBaseCost + SERVICE_CHARGE + totalFt;
        const vatAmount = preVat * VAT_RATE;
        const totalAmount = preVat + vatAmount;

        // Update UI
        breakdownBody.innerHTML = breakdownHTML;
        baseCostTotalEl.textContent = formatMoney(totalBaseCost);
        
        summaryBaseEl.textContent = `${formatMoney(totalBaseCost)} บาท`;
        summaryServiceEl.textContent = `${formatMoney(SERVICE_CHARGE)} บาท`;
        summaryFtEl.textContent = `${formatMoney(totalFt)} บาท`;
        summaryPreVatEl.textContent = `${formatMoney(preVat)} บาท`;
        summaryVatEl.textContent = `${formatMoney(vatAmount)} บาท`;
        
        totalAmountEl.innerHTML = `${formatMoney(totalAmount)} <span class="currency">บาท</span>`;

        // Show the result card if hidden
        resultCard.classList.remove('hidden');
    });
    
    // Add enter key support
    unitsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculateBtn.click();
        }
    });
});

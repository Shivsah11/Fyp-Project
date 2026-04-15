import mongoose from 'mongoose';
import Booking from '../Backend/Src/Models/Booking.js';
import Property from '../Backend/Src/Models/Property.js';

// Mocking logic from BookingController.js
function calculateTotalAmount(basePrice, checkInDate, checkOutDate) {
    let totalAmount = 0;
    const price = Number(typeof basePrice === 'string' ? basePrice.replace(/[^0-9]/g, '') : basePrice);
    
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const timeDiff = end.getTime() - start.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      console.log(`Days: ${days}`);
      
      if (days <= 0) {
        totalAmount = price;
      } else if (days <= 30) {
        totalAmount = price;
      } else {
        const fullMonths = Math.floor(days / 30);
        const remainingDays = days % 30;
        const months = remainingDays > 15 ? fullMonths + 1 : fullMonths;
        console.log(`Months: ${months}`);
        totalAmount = price * (months || 1);
      }
    } else {
      totalAmount = price;
    }
    return totalAmount;
}

// Test cases
const tests = [
    { start: '2026-04-15', end: '2026-06-15', price: 15000, expected: 30000 }, // 2 months
    { start: '2026-04-15', end: '2026-05-15', price: 15000, expected: 15000 }, // 1 month
    { start: '2026-04-15', end: '2026-05-31', price: 15000, expected: 30000 }, // 46 days -> 2 months
    { start: '2026-04-15', end: '2026-05-25', price: 15000, expected: 15000 }, // 40 days -> 1 month (remaining 10 < 15)
];

tests.forEach((t, i) => {
    const result = calculateTotalAmount(t.price, t.start, t.end);
    console.log(`Test ${i+1}: ${t.start} to ${t.end} @ ${t.price} -> ${result} (Expected: ${t.expected})`);
    if (result !== t.expected) {
        console.error(`FAILED: Expected ${t.expected} but got ${result}`);
    } else {
        console.log(`PASSED`);
    }
});

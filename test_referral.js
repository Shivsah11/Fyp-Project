// Using native fetch
async function runTest() {
  const timestamp = Date.now();
  const userAEmail = `userA_${timestamp}@test.com`;
  const userBEmail = `userB_${timestamp}@test.com`;

  console.log("=== Testing Secure Referral & Coin System ===");
  
  // 1. Create User A
  console.log(`\nCreating Referrer (User A): ${userAEmail}`);
  const userARes = await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'Referrer',
      email: userAEmail,
      password: 'password123',
      role: 'Tenant'
    })
  });
  
  const userAData = await userARes.json();
  if (!userARes.ok) {
    console.error("Failed to create User A:", userAData);
    return;
  }
  
  const userARefCode = userAData.user.referralCode;
  console.log("User A created successfully.");
  console.log("User A Referral Code:", userARefCode);
  console.log("User A Starting Coins:", userAData.user.coins); // Should be 0
  
  // 2. Create User B with User A's referral code
  console.log(`\nCreating Referred Friend (User B): ${userBEmail} with ref code: ${userARefCode}`);
  const userBRes = await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'Friend',
      email: userBEmail,
      password: 'password123',
      role: 'Tenant',
      ref: userARefCode
    })
  });
  
  const userBData = await userBRes.json();
  if (!userBRes.ok) {
    console.error("Failed to create User B:", userBData);
    return;
  }
  console.log("User B created successfully.");
  console.log("User B Starting Coins:", userBData.user.coins); // Should be 25
  
  // 3. Fetch User A Dashboard to check updated coins
  console.log("\nFetching User A's Dashboard to check updated coins...");
  const dashboardRes = await fetch('http://localhost:5000/api/dashboard', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${userAData.token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const dashboardData = await dashboardRes.json();
  if (!dashboardRes.ok) {
    console.error("Failed to fetch dashboard:", dashboardData);
    return;
  }
  
  console.log("User A Updated Coins:", dashboardData.data.user.coins); // Should be 50
  
  console.log("\n=== Test Final Evaluation ===");
  if (userBData.user.coins === 25 && dashboardData.data.user.coins >= 50) {
    console.log("✅ REFERRAL SYSTEM IS WORKING PERFECTLY!");
  } else {
    console.log("❌ REFERRAL SYSTEM HAS ISSUES.");
    console.log(`Expected B to have 25, got ${userBData.user.coins}`);
    console.log(`Expected A to have 50+, got ${dashboardData.data.user.coins}`);
  }
}

runTest().catch(console.error);

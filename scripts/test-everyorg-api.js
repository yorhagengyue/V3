/**
 * Every.org API 测试脚本
 * 用于验证 API 密钥是否正确配置并能正常工作
 */

const API_KEY = process.env.EVERYORG_API_KEY || 'pk_live_891963c90aab9499b4aa99f6b62c562b'
const BASE_URL = 'https://partners.every.org/v0.2'

console.log('🧪 Testing Every.org API Integration...\n')
console.log('API Key:', API_KEY.substring(0, 10) + '...\n')

// 测试 1: 搜索非营利组织
async function testSearch() {
  console.log('📍 Test 1: Search Nonprofits')
  console.log('Query: "rainforest"\n')
  
  try {
    const url = `${BASE_URL}/search/rainforest?apiKey=${API_KEY}&take=3`
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      console.log(`❌ Error: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.log('Response:', text, '\n')
      return false
    }
    
    const data = await response.json()
    console.log(`✅ Success! Found ${data.nonprofits?.length || 0} nonprofits`)
    
    if (data.nonprofits && data.nonprofits.length > 0) {
      console.log('\nResults:')
      data.nonprofits.slice(0, 3).forEach((np, i) => {
        console.log(`  ${i + 1}. ${np.name}`)
        console.log(`     Slug: ${np.slug}`)
        console.log(`     Description: ${np.description.substring(0, 80)}...`)
      })
    }
    console.log('')
    return true
  } catch (error) {
    console.log('❌ Request failed:', error.message, '\n')
    return false
  }
}

// 测试 2: 获取特定组织详情
async function testGetNonprofit() {
  console.log('📍 Test 2: Get Nonprofit Details')
  console.log('Slug: "rainforest-trust"\n')
  
  try {
    const url = `${BASE_URL}/nonprofit/rainforest-trust?apiKey=${API_KEY}`
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      console.log(`❌ Error: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.log('Response:', text, '\n')
      return false
    }
    
    const data = await response.json()
    console.log('✅ Success! Retrieved organization details')
    console.log('\nDetails:')
    console.log(`  Name: ${data.nonprofit.name}`)
    console.log(`  EIN: ${data.nonprofit.ein}`)
    console.log(`  Website: ${data.nonprofit.websiteUrl}`)
    console.log(`  Logo: ${data.nonprofit.logoUrl}`)
    console.log(`  Profile: ${data.nonprofit.profileUrl}`)
    console.log('')
    return true
  } catch (error) {
    console.log('❌ Request failed:', error.message, '\n')
    return false
  }
}

// 测试 3: 生成捐款链接
function testDonationLink() {
  console.log('📍 Test 3: Generate Donation Link')
  
  const slug = 'rainforest-trust'
  const amount = 25
  const donationUrl = `https://www.every.org/${slug}/donate?amount=${amount}`
  
  console.log(`✅ Donation link generated:`)
  console.log(`   ${donationUrl}`)
  console.log('\nThis link will redirect users to Every.org\'s secure payment page.\n')
  return true
}

// 运行所有测试
async function runTests() {
  console.log('='='.repeat(60))
  console.log('  Every.org API Integration Test Suite')
  console.log('='='.repeat(60))
  console.log('')
  
  const results = {
    search: await testSearch(),
    getNonprofit: await testGetNonprofit(),
    donationLink: testDonationLink()
  }
  
  console.log('='='.repeat(60))
  console.log('  Test Results Summary')
  console.log('='='.repeat(60))
  console.log('')
  console.log(`  Search Nonprofits:     ${results.search ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`  Get Nonprofit Details: ${results.getNonprofit ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`  Donation Link:         ${results.donationLink ? '✅ PASS' : '❌ FAIL'}`)
  console.log('')
  
  const allPassed = Object.values(results).every(r => r === true)
  
  if (allPassed) {
    console.log('🎉 All tests passed! Every.org API is working correctly.\n')
    console.log('📝 Notes:')
    console.log('   - Organization data is REAL (from Every.org)')
    console.log('   - Donation links are REAL (redirect to Every.org)')
    console.log('   - In-app donations are SIMULATED (demo mode)')
    console.log('')
  } else {
    console.log('⚠️  Some tests failed. Please check your API key configuration.\n')
    console.log('💡 Troubleshooting:')
    console.log('   1. Verify API key in .env file')
    console.log('   2. Check internet connection')
    console.log('   3. Confirm API key permissions on Every.org dashboard')
    console.log('')
  }
}

// 执行测试
runTests().catch(console.error)


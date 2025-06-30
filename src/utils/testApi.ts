// Test Poster API through proxy
export async function testPosterApi() {
  const url = '/api/poster/storage.getStorages?token=218047:05891220e474bad7f26b6eaa0be3f344'

  console.log('🧪 Testing Poster API directly...')
  console.log('URL:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ API Response:', data)
    return data
  } catch (error) {
    console.error('❌ API Test failed:', error)
    throw error
  }
}

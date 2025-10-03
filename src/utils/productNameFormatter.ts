/**
 * Utility functions for formatting product names
 */

/**
 * Clean and format product name
 * - Remove quotation marks (« », " ")
 * - Remove unnecessary words and characters
 * - Remove dots and "л" (liters)
 * - Remove commas except when between numbers (like 0,5)
 * - Convert to title case (first letter of each word capitalized)
 */
export function formatProductName(name: string): string {
  if (!name) return ''

  let cleanedName = name

  // Remove quotation marks
  cleanedName = cleanedName.replace(/[«»""''`]/g, '')

  // Remove unnecessary words and phrases (case-insensitive)
  const wordsToRemove = [
    '\\(розливне\\)',
    'розливне',
    'розл',
    'КЕГ',
    '\\(КЕГ\\)',
    'пастеризоване',
    'металева банка',
    'ПЕТ',
    '\\(ПЕТ\\)',
    'скло',
    '\\(скло\\)',
    'світле',
    'роз\\.',
    '\\(\\s*\\)',  // Empty parentheses
  ]

  // Create regex pattern to remove words
  const pattern = new RegExp(wordsToRemove.join('|'), 'gi')
  cleanedName = cleanedName.replace(pattern, '')

  // Remove "л" (liters) - both standalone and with space
  cleanedName = cleanedName.replace(/\s*л\b/gi, '')

  // Remove dots
  cleanedName = cleanedName.replace(/\./g, '')

  // Remove commas that are NOT between numbers (preserve 0,5 etc)
  // First, protect number,number patterns by replacing comma with a placeholder
  cleanedName = cleanedName.replace(/(\d),(\d)/g, '$1###COMMA###$2')
  // Remove all remaining commas
  cleanedName = cleanedName.replace(/,/g, '')
  // Restore the protected commas
  cleanedName = cleanedName.replace(/###COMMA###/g, ',')

  // Clean up extra spaces
  cleanedName = cleanedName.replace(/\s+/g, ' ').trim()

  // Remove standalone parentheses
  cleanedName = cleanedName.replace(/\(\s*\)/g, '').trim()
  cleanedName = cleanedName.replace(/\[\s*\]/g, '').trim()

  // Convert to title case (first letter of each word capitalized)
  if (cleanedName.length > 0) {
    const words = cleanedName.split(' ')
    const formattedWords = words.map((word) => {
      if (word.length === 0) return word
      // Capitalize first letter, lowercase the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    cleanedName = formattedWords.join(' ')
  }

  return cleanedName
}

/**
 * Format product name for display (preserves some formatting)
 * Alternative version that keeps proper nouns capitalized
 */
export function formatProductNamePreserveProperNouns(name: string): string {
  if (!name) return ''

  let cleanedName = name

  // Remove quotation marks
  cleanedName = cleanedName.replace(/[«»""''`]/g, '')

  // Remove unnecessary words and phrases (case-insensitive)
  const wordsToRemove = [
    '\\(розливне\\)',
    'розливне',
    'розл',
    'КЕГ',
    '\\(КЕГ\\)',
    'пастеризоване',
    'металева банка',
    'ПЕТ',
    '\\(ПЕТ\\)',
    'скло',
    '\\(скло\\)',
    'світле',
    'роз\\.',
  ]

  // Create regex pattern to remove words
  const pattern = new RegExp(wordsToRemove.join('|'), 'gi')
  cleanedName = cleanedName.replace(pattern, '')

  // Clean up extra spaces
  cleanedName = cleanedName.replace(/\s+/g, ' ').trim()

  // Remove standalone parentheses
  cleanedName = cleanedName.replace(/\(\s*\)/g, '').trim()
  cleanedName = cleanedName.replace(/\[\s*\]/g, '').trim()

  // Convert to sentence case but preserve brand names (words that were originally capitalized)
  const words = cleanedName.split(' ')
  const formattedWords = words.map((word, index) => {
    if (index === 0) {
      // First word: capitalize first letter, lowercase rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    } else {
      // Check if word was originally all caps or starts with capital (likely a brand name)
      const hasUpperCase = /[A-Z]/.test(word)
      if (hasUpperCase && word.length > 1) {
        // Preserve capitalization for brand names
        return word
      } else {
        // Lowercase other words
        return word.toLowerCase()
      }
    }
  })

  return formattedWords.join(' ')
}


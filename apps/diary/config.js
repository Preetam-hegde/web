/**
 * Diary App Configuration
 * 
 * Load environment variables from global .env file (at workspace root)
 * Create .env file by copying .env.example and filling in your credentials
 */

(async function initConfig() {
  try {
    // Try to load from root .env (global config)
    const response = await fetch('../../.env');
    if (!response.ok) throw new Error('.env file not found at workspace root');
    
    const envText = await response.text();
    const lines = envText.split('\n');
    
    const config = {};
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, value] = trimmed.split('=');
        config[key.trim()] = value.trim();
      }
    });

    window.DIARY_CONFIG = {
      authToken: config.DIARY_AUTH_TOKEN || '',
      spreadsheetId: config.DIARY_SPREADSHEET_ID || ''
    };

    console.log('✅ Diary config loaded from global .env', {
      authToken: config.DIARY_AUTH_TOKEN ? '***' : '⚠️ Not set',
      spreadsheetId: config.DIARY_SPREADSHEET_ID ? '✓' : '⚠️ Not set'
    });
  } catch (error) {
    console.warn('⚠️ Could not load .env file:', error.message);
    console.log('Please create a .env file at workspace root with DIARY_AUTH_TOKEN and DIARY_SPREADSHEET_ID');
    window.DIARY_CONFIG = { authToken: '', spreadsheetId: '' };
  }
})();

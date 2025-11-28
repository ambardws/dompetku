/**
 * Telegram Bot Webhook Endpoint
 * POST /api/bot/telegram/webhook
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const message = body.message

    if (!message) {
      return { ok: true }
    }

    const chatId = message.chat.id
    const text = message.text
    const username = message.from.username

    // Get config
    const config = useRuntimeConfig()
    const botToken = config.telegramBotToken
    const supabaseUrl = config.public.supabaseUrl
    const supabaseKey = config.public.supabaseKey

    // Handle /start command
    if (text === '/start') {
      await sendTelegramMessage(botToken, chatId,
        '👋 Selamat datang di Dompetku Bot!\n\n' +
        'Untuk menghubungkan bot dengan akun Anda:\n' +
        '1. Buka aplikasi web Dompetku\n' +
        '2. Klik menu "Link Telegram Bot"\n' +
        '3. Salin token yang muncul\n' +
        '4. Kirim token tersebut ke bot ini dengan perintah:\n' +
        '   /link [token]\n\n' +

        'Gunakan /commands untuk melihat daftar perintah yang tersedia.'
      )
      return { ok: true }
    }

    if (text === '/commands') {
      await sendTelegramMessage(botToken, chatId,
        '📜 Daftar Perintah Dompetku Bot:\n\n' +
        '/start - Informasi awal\n' +
        '/link [token] - Hubungkan bot dengan akun\n' +
        '/expense [jumlah] [kategori] [catatan] - Tambah transaksi pengeluaran\n' +
        '/income [jumlah] [kategori] [catatan] - Tambah transaksi pemasukan\n' +
        '/categories - Daftar kategori Anda'
      )
      return { ok: true }
    }

    // Handle /link command
    if (text?.startsWith('/link ')) {
      const token = text.replace('/link ', '').trim()

      // Call link API
      const linkResult = await $fetch('/api/bot/link', {
        method: 'POST',
        body: {
          token,
          platform: 'telegram',
          platformUserId: chatId.toString(),
          platformUsername: username
        }
      })

      if (linkResult.success) {
        await sendTelegramMessage(botToken, chatId,
          '✅ Berhasil menghubungkan bot dengan akun Anda!\n\n' +
          'Sekarang Anda bisa menambahkan transaksi dengan format:\n' +
          '/expense [jumlah] [kategori] [catatan]\n\n' +
          '/income [jumlah] [kategori] [catatan]\n\n' +
          'Contoh:\n' +
          '/expense 50000 makan Lunch di warung\n' +
          '/income 100000 gaji Gaji bulanan\n\n' +
          'Gunakan /commands untuk melihat daftar perintah yang tersedia.'
        )
      } else {
        await sendTelegramMessage(botToken, chatId,
          '❌ Gagal menghubungkan bot: ' + linkResult.message
        )
      }

      return { ok: true }
    }

    // handle get /categories command
    if (text?.startsWith('/categories')) {
      // Get bot user
      const botUserResponse = await fetch(
        `${supabaseUrl}/rest/v1/bot_users?platform=eq.telegram&platform_user_id=eq.${chatId}&select=user_id`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      )

      const botUsers = await botUserResponse.json()
      if (!botUsers || botUsers.length === 0) {
        await sendTelegramMessage(botToken, chatId,
          '❌ Bot belum terhubung dengan akun. Gunakan /link [token] terlebih dahulu.'
        )
        return { ok: true }
      }

      const botUser = botUsers[0]

      // Fetch categories
      const categoryResponse = await fetch(
        `${supabaseUrl}/rest/v1/categories?user_id=eq.${botUser.user_id}&select=name`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      )

      const categories = await categoryResponse.json()
      if (categories.length === 0) {
        await sendTelegramMessage(botToken, chatId,
          'ℹ️ Anda belum memiliki kategori. Silakan buat kategori terlebih dahulu di aplikasi web.'
        )
        return { ok: true }
      }

      const categoryList = categories.map((c: any) => `- ${c.name}`).join('\n')

      await sendTelegramMessage(botToken, chatId,
        `📂 Daftar Kategori Anda:\n\n${categoryList}`
      )
      return { ok: true }
    }

    // Handle /expense command for transactions
    if (text?.startsWith('/expense ') || text?.startsWith('/income ')) {
      // Get bot user
      const botUserResponse = await fetch(
        `${supabaseUrl}/rest/v1/bot_users?platform=eq.telegram&platform_user_id=eq.${chatId}&select=user_id`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      )

      const botUsers = await botUserResponse.json()
      if (!botUsers || botUsers.length === 0) {
        await sendTelegramMessage(botToken, chatId,
          '❌ Bot belum terhubung dengan akun. Gunakan /link [token] terlebih dahulu.'
        )
        return { ok: true }
      }

      const botUser = botUsers[0]

      const commandType = text.startsWith('/expense ') ? 'expense' : 'income'

      // Parse transaction: /expense or /income <amount> <category> <description>
      const parts =  commandType === 'expense' ? text.replace('/expense ', '').trim().split(' ') : text.replace('/income ', '').trim().split(' ')
      if (parts.length < 2) {
        await sendTelegramMessage(botToken, chatId,
          '❌ Format salah. Gunakan:\n/expense atau /income [jumlah] [kategori] [catatan]\n\n' +
          'Contoh:\n/expense 50000 makan Lunch di warung'
        )
        return { ok: true }
      }

      const amount = parseFloat(parts[0])
      const categoryName = parts[1]
      const description = parts.slice(2).join(' ') || 'Transaksi dari bot'

      if (isNaN(amount)) {
        await sendTelegramMessage(botToken, chatId, '❌ Jumlah tidak valid')
        return { ok: true }
      }

      // Find category (case-insensitive search)
      const categoryResponse = await fetch(
        `${supabaseUrl}/rest/v1/categories?user_id=eq.${botUser.user_id}&select=id,name`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      )

      const categories = await categoryResponse.json()

      const category = categories.find((c: any) =>
        c.name.toLowerCase() === categoryName.toLowerCase()
      )

      if (!category) {
        await sendTelegramMessage(botToken, chatId,
          `❌ Kategori "${categoryName}" tidak ditemukan. Buat kategori ini terlebih dahulu di aplikasi web.`
        )
        return { ok: true }
      }

      // Create transaction
      const createTxResponse = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: botUser.user_id,
          category_id: category.id,
          category: category.name,
          amount,
          note: description,
          type: commandType,
          created_at: new Date().toISOString()
        })
      })

      if (!createTxResponse.ok) {
        const errorText = await createTxResponse.text()
        console.error('Transaction error:', errorText)
        await sendTelegramMessage(botToken, chatId, '❌ Gagal menambahkan transaksi')
        return { ok: true }
      }

      await sendTelegramMessage(botToken, chatId,
        `✅ Transaksi berhasil ditambahkan!\n\n` +
        `💰 Jumlah: Rp ${amount.toLocaleString('id-ID')}\n` +
        `📁 Kategori: ${category.name}\n` +
        `📝 Catatan: ${description}`
      )

      return { ok: true }
    }

    // Unknown command
    await sendTelegramMessage(botToken, chatId,
      '❓ Perintah tidak dikenali.\n\n' +
      'Perintah yang tersedia:\n' +
      '/start - Informasi awal\n' +
      '/link [token] - Hubungkan bot dengan akun\n' +
      '/expense [jumlah] [kategori] [catatan] - Tambah transaksi pengeluaran\n' +
      '/income [jumlah] [kategori] [catatan] - Tambah transaksi pemasukan\n' +
      '/categories - Daftar kategori Anda'
    )

    return { ok: true }
  } catch (error: any) {
    console.error('Webhook error:', error)
    return { ok: false, error: error.message }
  }
})

// Helper function to send Telegram message
async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    })
  })
}

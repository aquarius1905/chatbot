/**
 * 日時フォーマットユーティリティ。
 *
 * SQLite は UTC で保存するが末尾に `Z` がない文字列で返す。
 * `new Date()` はタイムゾーン指定のない文字列をローカルタイムとして解釈するため、
 * 明示的に `Z` を付与して UTC として扱わせる。
 */

const jstDateTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Tokyo',
})

export function formatJstTime(iso: string): string {
  const normalized = iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z'
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return iso
  // Intl.DateTimeFormat の ja-JP は "2024/01/01 12:00" 形式で返す
  return jstDateTimeFormatter.format(d)
}
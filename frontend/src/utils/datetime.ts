/**
 * 日時フォーマットユーティリティ。
 *
 * バックエンドは UTC の datetime 文字列を返すが、末尾に `Z` がない場合がある。
 * `new Date()` はタイムゾーン指定のない文字列をローカルタイムとして解釈するため、
 * 明示的に `Z` を付与して UTC として扱わせる。
 */

const jstTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Tokyo',
})

export function formatJstTime(iso: string): string {
  const normalized = iso.endsWith('Z') ? iso : iso + 'Z'
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return iso
  return jstTimeFormatter.format(d)
}

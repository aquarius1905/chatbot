/**
 * 日時フォーマットユーティリティ。
 *
 * バックエンドは `datetime.now(timezone.utc)` で生成した UTC 文字列（末尾 `Z` あり）を返す。
 * `timeZone: 'Asia/Tokyo'` を指定することで JST に変換して表示する。
 */

const jstTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Tokyo',
})

export function formatJstTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return jstTimeFormatter.format(d)
}
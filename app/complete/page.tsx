import Link from 'next/link'

export default function CompletePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">エントリー受付完了！</h1>
        <p className="mb-6">
          出演の可否は23:00頃に決定予定です。<br />
          下記で交番表をご確認ください。
        </p>
        <Link
          href="/schedule"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700"
        >
          交番表ページへ
        </Link>
        <p className="mt-4 text-sm text-gray-600">
          ※このページをブックマーク推奨
        </p>
      </div>
    </div>
  )
}
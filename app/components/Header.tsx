import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
      <h1 className="text-lg font-bold text-gray-900">DiagramBuilder</h1>
      <Link
        href="/settings"
        className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition-colors text-gray-700"
      >
        設定
      </Link>
    </header>
  );
}

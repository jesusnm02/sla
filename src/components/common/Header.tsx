import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-900 text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">
          <Link href="/">SLA Simulator</Link>
        </h1>
      </div>
    </header>
  );
};

export default Header;

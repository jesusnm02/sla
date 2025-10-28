'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, DatabaseZap, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { href: '/simulation', icon: DatabaseZap, text: 'Simulation' },
    { href: '/penalties', icon: ShieldAlert, text: 'Penalties' },
  ];

  return (
    <aside className="bg-gray-800 text-white w-64 h-screen p-4">
      <nav>
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center p-2 rounded-lg ${
                  pathname === link.href ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                <link.icon className="w-6 h-6 mr-2" />
                {link.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

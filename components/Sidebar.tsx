'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChartBarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Appointments', href: '#', icon: CalendarDaysIcon },
  { name: 'Patients', href: '#', icon: UserGroupIcon },
  { name: 'Reports', href: '#', icon: BriefcaseIcon },
  { name: 'Settings', href: '#', icon: Cog6ToothIcon },
];

const Sidebar = () => {
  const [activeNav, setActiveNav] = useState('Dashboard');

  return (
    <aside className="hidden md:flex md:flex-col w-24 bg-white items-center py-8">
      <div className="flex-1 flex flex-col items-center space-y-8">
        {navigation.map((item) => {
          const isActive = activeNav === item.name;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setActiveNav(item.name)}
              className={`
                h-14 w-14 flex items-center justify-center rounded-full transition-colors duration-200
                ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-[#8B5CF6] hover:bg-blue-50 '
                }
              `}
              aria-label={item.name}
            >
              <item.icon className="h-7 w-7" />
            </Link>
          );
        })}
      </div>
      <div className="mt-auto">
        <div className="h-14 w-14 flex items-center justify-center rounded-full bg-gray-100 border-2 border-white">
          <span className="text-lg font-semibold text-gray-600">LS</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-3xl font-bold ${color} mt-1`}>{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

export default StatCard;

// For staff stat card
export const StaffStatCard = ({ title, value, icon: Icon, trend, trendUp, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50 border-blue-200',
    yellow: 'from-yellow-500 to-yellow-600 text-yellow-600 bg-yellow-50 border-yellow-200',
    green: 'from-green-500 to-green-600 text-green-600 bg-green-50 border-green-200',
    red: 'from-red-500 to-red-600 text-red-600 bg-red-50 border-red-200'
  };

  const gradientClass = colorClasses[color]?.split(' ')[0] + ' ' + colorClasses[color]?.split(' ')[1];
  const textColorClass = colorClasses[color]?.split(' ')[2];
  const bgColorClass = colorClasses[color]?.split(' ')[3];
  const borderColorClass = colorClasses[color]?.split(' ')[4];

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${borderColorClass} p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {trend && (
            <div className="flex items-center">
              {trendUp ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${bgColorClass} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${textColorClass}`} />
        </div>
      </div>
    </div>
  );
};
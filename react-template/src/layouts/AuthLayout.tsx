import React from 'react';
import logo from '../assets/images/logo512.png';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {/* Sticky Header */}
            <header className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center">
                            <div className="inline-flex items-center justify-center w-50 h-10">
                                <img src={logo} alt="Application name" className="w-50 h-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Scrollable Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
                <div className="min-h-full flex items-center justify-center px-4 py-8 sm:py-12">
                    <div className="w-full flex justify-center">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AuthLayout; 
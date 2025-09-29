import { useAuthContext } from '../../context/auth/AuthContext';
import { getNameInitials } from '../../utils/functions';

export const ProfileScreen = () => {

    const { user } = useAuthContext();


    const userInitials = user ? getNameInitials(user.name) : '';

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="p-6 sm:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">Your account information</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-white text-2xl font-bold">
                                {userInitials}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-gray-900 break-words">{user.name}</h2>
                        </div>
                    </div>
                </div>

                {/* Information Section */}
                <div className="p-6">
                    <div className="grid gap-6">

                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-2 block">Username</label>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i className="pi pi-at text-primary-600 text-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-gray-900 font-medium break-all">{user.username}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-2 block">Email Address</label>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i className="pi pi-envelope text-primary-600 text-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-gray-900 font-medium break-all">{user.email}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-2 block">Role</label>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i className="pi pi-shield text-primary-600 text-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-gray-900 font-medium capitalize break-all">{user.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 
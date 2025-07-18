import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const TokenVerificationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { verifyToken } = useAuth();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');

    // Extract token once
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No token provided');
            return;
        }

        const verify = async () => {
            try {
                await verifyToken(token);
                setStatus('success');
                // Redirect after a short delay for feedback
                setTimeout(() => {
                    navigate('/admin', { replace: true });
                }, 500);
            } catch (error) {
                setStatus('error');
                setMessage('Verification failed or token already used.');
            }
        };

        verify();
        // eslint-disable-next-line
    }, []); // Only run once on mount

    const getStatusIcon = () => {
        switch (status) {
            case 'verifying':
                return <Loader2 className="animate-spin h-12 w-12 text-blue-600" />;
            case 'success':
                return <CheckCircle className="h-12 w-12 text-green-600" />;
            case 'error':
                return <XCircle className="h-12 w-12 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'verifying':
                return 'Verifying your login...';
            case 'success':
                return 'Login Successful!';
            case 'error':
                return 'Verification Failed';
            default:
                return '';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'verifying':
                return 'text-blue-600';
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <div className="mx-auto h-16 w-16 flex items-center justify-center">
                        {getStatusIcon()}
                    </div>
                    <h2 className={`mt-6 text-center text-3xl font-extrabold ${getStatusColor()}`}>
                        {getStatusText()}
                    </h2>
                </div>

                <div className="mt-8">
                    <p className="text-sm text-gray-600">
                        {message}
                    </p>
                </div>

                {status === 'error' && (
                    <div className="mt-6">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {status === 'verifying' && (
                    <div className="mt-6">
                        <p className="text-xs text-gray-500">
                            Please wait while we verify your login token...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TokenVerificationPage; 